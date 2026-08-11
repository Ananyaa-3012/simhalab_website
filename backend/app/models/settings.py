from sqlalchemy import Column, Integer, String, Text
from ..database import Base
from .base import TimestampMixin


class SiteSetting(Base, TimestampMixin):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text)
    value_type = Column(String, default="text")  # text, url, html, json
