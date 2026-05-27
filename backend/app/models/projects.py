from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)


class ProjectTag(Base):
    __tablename__ = "project_tags"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    person_id = Column(Integer, ForeignKey("people.id", ondelete="CASCADE"), nullable=False)
    role = Column(String)  # PI, Co-PI, Student


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description_html = Column(Text)
    image_path = Column(String)
    status = Column(String, nullable=False, default="ongoing")  # ongoing, completed
    start_date = Column(String)
    end_date = Column(String)
    research_area_id = Column(Integer, ForeignKey("research_areas.id", ondelete="SET NULL"))
    is_active = Column(Boolean, default=True)

    research_area = relationship("ResearchArea", backref="projects")
    tags = relationship("Tag", secondary="project_tags", backref="projects")
    members = relationship("Person", secondary="project_members", backref="projects")
