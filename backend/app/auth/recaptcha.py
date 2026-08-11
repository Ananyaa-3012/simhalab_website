import httpx
from fastapi import HTTPException
from ..config import get_settings

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"


async def verify_recaptcha(token: str, min_score: float = 0.5) -> bool:
    settings = get_settings()
    if not settings.recaptcha_secret_key:
        return True

    async with httpx.AsyncClient() as client:
        response = await client.post(
            RECAPTCHA_VERIFY_URL,
            data={
                "secret": settings.recaptcha_secret_key,
                "response": token,
            },
        )

    result = response.json()
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail="reCAPTCHA verification failed")

    if result.get("score", 0) < min_score:
        raise HTTPException(status_code=400, detail="reCAPTCHA score too low")

    return True
