from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class Person(Base, TimestampMixin):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    photo_path = Column(String)
    role = Column(String)
    designation = Column(String)
    department = Column(String)
    category = Column(String, nullable=False)  # faculty, project_associate, postdoc, phd, pg, ug, alumni
    bio_html = Column(Text)
    research_interests = Column(Text)  # JSON array of strings
    email = Column(String)
    phone = Column(String)
    github_url = Column(String)
    google_scholar_url = Column(String)
    personal_website_url = Column(String)
    linkedin_url = Column(String)
    orcid_url = Column(String)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    publication_links = relationship("PublicationAuthor", back_populates="person")


class PublicationAuthor(Base):
    __tablename__ = "publication_authors"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id", ondelete="CASCADE"), nullable=False)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False)
    author_order = Column(Integer, default=0)

    person = relationship("Person", back_populates="publication_links")
    publication = relationship("Publication", back_populates="author_links")
