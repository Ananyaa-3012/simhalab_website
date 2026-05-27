from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


class Flowchart(Base, TimestampMixin):
    __tablename__ = "flowcharts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    nodes = relationship("FlowchartNode", back_populates="flowchart", cascade="all, delete-orphan")
    edges = relationship("FlowchartEdge", back_populates="flowchart", cascade="all, delete-orphan")


class FlowchartNode(Base, TimestampMixin):
    __tablename__ = "flowchart_nodes"
    __table_args__ = (UniqueConstraint("flowchart_id", "node_id"),)

    id = Column(Integer, primary_key=True, index=True)
    flowchart_id = Column(Integer, ForeignKey("flowcharts.id", ondelete="CASCADE"), nullable=False)
    node_id = Column(String, nullable=False)
    label = Column(String, nullable=False)
    description = Column(Text)
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    node_type = Column(String, default="default")
    style_json = Column(Text)

    flowchart = relationship("Flowchart", back_populates="nodes")


class FlowchartEdge(Base, TimestampMixin):
    __tablename__ = "flowchart_edges"
    __table_args__ = (UniqueConstraint("flowchart_id", "edge_id"),)

    id = Column(Integer, primary_key=True, index=True)
    flowchart_id = Column(Integer, ForeignKey("flowcharts.id", ondelete="CASCADE"), nullable=False)
    edge_id = Column(String, nullable=False)
    source_node_id = Column(String, nullable=False)
    target_node_id = Column(String, nullable=False)
    label = Column(String)
    edge_type = Column(String, default="smoothstep")
    style_json = Column(Text)

    flowchart = relationship("Flowchart", back_populates="edges")
