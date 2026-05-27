from sqlalchemy import Column, Integer, String, Boolean, DateTime
from ..database import Base
from .base import TimestampMixin


class AdminUser(Base, TimestampMixin):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    google_id = Column(String, unique=True)
    role = Column(String, default="admin")
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
