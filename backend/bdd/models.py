from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Device(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    ip: str
    name: Optional[str] = None
    status: Optional[str] = None
    model: Optional[str] = None
    serial: Optional[str] = None
    version: Optional[str] = None
    vendor: Optional[str] = None
    os: Optional[str] = None
    selected: bool = False
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    configuration: Optional[str] = None
    stacked_models: Optional[str] = None  # JSON stringified list
    stacked_serials: Optional[str] = None  # JSON stringified list
    project: Optional["Project"] = Relationship(back_populates="devices")

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    creator: str
    description: Optional[str] = None
    created_at: str
    devices: List["Device"] = Relationship(back_populates="project")