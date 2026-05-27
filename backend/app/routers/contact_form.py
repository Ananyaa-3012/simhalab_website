from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from ..auth.recaptcha import verify_recaptcha

router = APIRouter(prefix="/api/public", tags=["public"])


class ContactFormSubmission(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    recaptcha_token: str = ""

    @field_validator("name", "subject", "message")
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_length(cls, v):
        if len(v) > 5000:
            raise ValueError("Message too long (max 5000 characters)")
        return v


@router.post("/contact-form")
async def submit_contact_form(form: ContactFormSubmission):
    await verify_recaptcha(form.recaptcha_token)
    # In production, this would send an email or store the submission
    return {"message": "Thank you for your message. We will get back to you soon."}
