from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class PersonBase(BaseModel):
    name: str
    photo_path: Optional[str] = None
    role: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    category: str
    bio_html: Optional[str] = None
    research_interests: Optional[str] = None  # JSON string
    email: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    personal_website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    orcid_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        allowed = {"faculty", "admin", "phd", "pg", "ug", "alumni"}
        if v not in allowed:
            raise ValueError(f"Category must be one of: {allowed}")
        return v


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    name: Optional[str] = None
    photo_path: Optional[str] = None
    role: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    bio_html: Optional[str] = None
    research_interests: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    personal_website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    orcid_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class PersonResponse(PersonBase):
    id: int

    class Config:
        from_attributes = True
