from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Testimonial(Base, TimestampMixin):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    quote_text = Column(Text, nullable=False)
    person_name = Column(String, nullable=False)
    person_role = Column(String)
    person_photo_path = Column(String)
    organization = Column(String)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
