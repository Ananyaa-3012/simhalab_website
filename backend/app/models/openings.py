from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base
from .base import TimestampMixin


class Opening(Base, TimestampMixin):
    __tablename__ = "openings"

    id = Column(Integer, primary_key=True, index=True)
    position_title = Column(String, nullable=False)
    position_type = Column(String, nullable=False)  # phd, postdoc, postbacc, internship, other
    description_html = Column(Text, nullable=False)
    requirements_html = Column(Text)
    deadline = Column(String)  # ISO date
    apply_url = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
