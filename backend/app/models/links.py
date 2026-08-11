from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Link(Base, TimestampMixin):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    category = Column(String, nullable=False)  # github, newsletter, blog, resource, other
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
