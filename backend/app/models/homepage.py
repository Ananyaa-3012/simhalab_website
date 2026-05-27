from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class CarouselSlide(Base, TimestampMixin):
    __tablename__ = "carousel_slides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    subtitle = Column(String(200))
    image_path = Column(String, nullable=False)
    cta_text = Column(String(30))
    cta_link = Column(String)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class LabHeadMessage(Base, TimestampMixin):
    __tablename__ = "lab_head_message"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    photo_path = Column(String, nullable=False)
    message_html = Column(Text, nullable=False)


class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    link_url = Column(String)
    link_text = Column(String)
    announcement_type = Column(String, nullable=False)  # recruitment, general, urgent
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    start_date = Column(String)  # ISO date
    end_date = Column(String)  # ISO date
