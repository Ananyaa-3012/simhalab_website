from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class ResearchArea(Base, TimestampMixin):
    __tablename__ = "research_areas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description_html = Column(Text)
    image_path = Column(String)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
