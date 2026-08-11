from pydantic import BaseModel, field_validator
from typing import Optional


class PublicationBase(BaseModel):
    title: str
    authors: str
    venue: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    pub_type: str
    doi_url: Optional[str] = None
    pdf_url: Optional[str] = None
    abstract_html: Optional[str] = None
    research_area_id: Optional[int] = None
    is_featured: bool = False

    @field_validator("pub_type")
    @classmethod
    def valid_pub_type(cls, v):
        allowed = {"journal", "conference", "preprint", "book_chapter", "thesis"}
        if v not in allowed:
            raise ValueError(f"pub_type must be one of: {allowed}")
        return v

    @field_validator("year")
    @classmethod
    def valid_year(cls, v):
        if v is not None and (v < 1900 or v > 2100):
            raise ValueError("Year must be between 1900 and 2100")
        return v


class PublicationCreate(PublicationBase):
    linked_author_ids: Optional[list[int]] = None


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    pub_type: Optional[str] = None
    doi_url: Optional[str] = None
    pdf_url: Optional[str] = None
    abstract_html: Optional[str] = None
    research_area_id: Optional[int] = None
    is_featured: Optional[bool] = None
    linked_author_ids: Optional[list[int]] = None


class PublicationResponse(PublicationBase):
    id: int
    linked_author_ids: list[int] = []

    class Config:
        from_attributes = True
