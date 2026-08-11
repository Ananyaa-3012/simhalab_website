from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
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
    links_json = Column(Text)            # JSON: [{title, url}, ...]
    media_json = Column(Text)            # JSON: [{type, title, url}, ...]
    contact_person_id = Column(Integer, ForeignKey("people.id"), nullable=True)
