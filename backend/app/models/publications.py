from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class Publication(Base, TimestampMixin):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(Text, nullable=False)  # display string
    venue = Column(String)
    year = Column(Integer)
    month = Column(Integer)
    pub_type = Column(String, nullable=False)  # journal, conference, preprint, book_chapter, thesis
    doi_url = Column(String)
    pdf_url = Column(String)
    abstract_html = Column(Text)
    research_area_id = Column(Integer, ForeignKey("research_areas.id", ondelete="SET NULL"))
    is_featured = Column(Boolean, default=False)

    research_area = relationship("ResearchArea", backref="publications")
    author_links = relationship("PublicationAuthor", back_populates="publication", cascade="all, delete-orphan")
