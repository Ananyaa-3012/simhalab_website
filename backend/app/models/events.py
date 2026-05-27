from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description_html = Column(Text)
    image_path = Column(String)
    event_date = Column(String, nullable=False)  # ISO date
    end_date = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    venue = Column(String)
    event_url = Column(String)
    is_active = Column(Boolean, default=True)
