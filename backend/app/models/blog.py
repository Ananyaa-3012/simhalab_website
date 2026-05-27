from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class BlogPost(Base, TimestampMixin):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    content_html = Column(Text, nullable=False)
    excerpt = Column(String(300))
    cover_image_path = Column(String)
    author_id = Column(Integer, ForeignKey("people.id", ondelete="SET NULL"))
    is_published = Column(Boolean, default=False)
    published_date = Column(String)  # ISO date

    author = relationship("Person", backref="blog_posts")
