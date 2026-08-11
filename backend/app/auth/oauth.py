import httpx
from fastapi import APIRouter, Request, Response, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from urllib.parse import urlencode

from ..config import get_settings
from ..database import get_db
from ..models.auth import AdminUser
from .jwt import create_access_token, create_refresh_token, verify_token
from .recaptcha import verify_recaptcha

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


# --- Dev/Testing: Username+Password login ---
class DevLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/dev-login")
async def dev_login(data: DevLoginRequest, response: Response, db: Session = Depends(get_db)):
    """Username/password login for local testing only.
    In production, disable by setting DEV_ADMIN_PASSWORD to empty in .env."""
    dev_password = settings.dev_admin_password
    if not dev_password:
        raise HTTPException(status_code=403, detail="Dev login disabled in production")

    if data.password != dev_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if data.email not in settings.allowed_emails_list:
        raise HTTPException(status_code=403, detail="Email not authorized")

    user = db.query(AdminUser).filter(AdminUser.email == data.email).first()
    if not user:
        user = AdminUser(email=data.email, name=data.email.split("@")[0], google_id=None)
        db.add(user)
        db.commit()
        db.refresh(user)

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token({"sub": data.email})
    refresh_token = create_refresh_token({"sub": data.email})

    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, secure=False, samesite="lax",
        max_age=settings.jwt_access_expiry_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, secure=False, samesite="lax",
        max_age=settings.jwt_refresh_expiry_days * 86400,
    )

    return {"message": "Login successful", "user": {"email": data.email, "name": user.name}}

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/login")
async def login(recaptcha_token: str = ""):
    if settings.recaptcha_secret_key and recaptcha_token:
        await verify_recaptcha(recaptcha_token)

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    return {"auth_url": f"{GOOGLE_AUTH_URL}?{urlencode(params)}"}


@router.get("/callback")
async def callback(code: str, response: Response, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange authorization code")

    token_data = token_response.json()
    access_token_google = token_data.get("access_token")

    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token_google}"},
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get user info")

    userinfo = userinfo_response.json()
    email = userinfo.get("email")
    name = userinfo.get("name", "")
    google_id = userinfo.get("id")

    if email not in settings.allowed_emails_list:
        raise HTTPException(status_code=403, detail="Access denied. Email not authorized.")

    user = db.query(AdminUser).filter(AdminUser.email == email).first()
    if not user:
        user = AdminUser(email=email, name=name, google_id=google_id)
        db.add(user)
    else:
        user.name = name
        user.google_id = google_id

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": email})
    refresh_token = create_refresh_token({"sub": email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.jwt_access_expiry_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.jwt_refresh_expiry_days * 86400,
    )

    return {"message": "Login successful", "user": {"email": email, "name": name}}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = verify_token(refresh_token, "refresh")
    email = payload.get("sub")

    new_access = create_access_token({"sub": email})
    new_refresh = create_refresh_token({"sub": email})

    response.set_cookie(
        key="access_token", value=new_access,
        httponly=True, secure=True, samesite="strict",
        max_age=settings.jwt_access_expiry_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token", value=new_refresh,
        httponly=True, secure=True, samesite="strict",
        max_age=settings.jwt_refresh_expiry_days * 86400,
    )

    return {"message": "Token refreshed"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me")
async def me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_token(token, "access")
    email = payload.get("sub")
    user = db.query(AdminUser).filter(AdminUser.email == email, AdminUser.is_active == True).first()
    if not user:
        raise HTTPException(status_code=403, detail="Access denied")

    return {"email": user.email, "name": user.name, "role": user.role}
