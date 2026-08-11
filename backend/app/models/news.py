from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class News(Base, TimestampMixin):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    summary = Column(String(300))
    content_html = Column(Text)
    image_path = Column(String)
    source_name = Column(String)
    source_url = Column(String)
    published_date = Column(String, nullable=False)  # ISO date
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
