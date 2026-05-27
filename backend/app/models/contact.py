from sqlalchemy import Column, Integer, String, Text
from ..database import Base
from .base import TimestampMixin


class ContactInfo(Base, TimestampMixin):
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String)
    email = Column(String)
    address_html = Column(Text)
    google_maps_embed_url = Column(String)
    google_maps_link = Column(String)
    office_hours = Column(String)
