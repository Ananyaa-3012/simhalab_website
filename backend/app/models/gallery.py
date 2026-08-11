from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class GalleryCategory(Base, TimestampMixin):
    __tablename__ = "gallery_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    display_order = Column(Integer, default=0)

    images = relationship("GalleryImage", back_populates="category")


class GalleryImage(Base, TimestampMixin):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    caption = Column(String)
    alt_text = Column(String, nullable=False)
    event_name = Column(String)
    date_taken = Column(String)  # ISO date
    category_id = Column(Integer, ForeignKey("gallery_categories.id", ondelete="SET NULL"))
    display_order = Column(Integer, default=0)

    category = relationship("GalleryCategory", back_populates="images")
