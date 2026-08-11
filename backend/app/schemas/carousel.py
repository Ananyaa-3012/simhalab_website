from pydantic import BaseModel, field_validator
from typing import Optional


class CarouselSlideBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_path: str
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

    @field_validator("title")
    @classmethod
    def title_max_length(cls, v):
        if len(v) > 100:
            raise ValueError("Title must be 100 characters or less")
        return v


class CarouselSlideCreate(CarouselSlideBase):
    pass


class CarouselSlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_path: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CarouselSlideResponse(CarouselSlideBase):
    id: int

    class Config:
        from_attributes = True
