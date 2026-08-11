from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Sponsor(Base, TimestampMixin):
    __tablename__ = "sponsors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo_path = Column(String, nullable=False)
    website_url = Column(String)
    description = Column(Text)
    sponsor_type = Column(String, nullable=False)  # sponsor, collaborator
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
