from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Download(Base, TimestampMixin):
    __tablename__ = "downloads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=False)
    category = Column(String, default="other")  # dataset, code, paper, other
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
