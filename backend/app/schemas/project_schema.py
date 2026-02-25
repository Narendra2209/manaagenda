from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class ProjectStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class ProjectCreate(BaseModel):
    name: str
    description: str
    client_id: str
    service_request_id: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    client_id: str
    service_request_id: str
    employee_ids: List[str]
    status: str
    created_at: str


class AssignEmployeesRequest(BaseModel):
    employee_ids: List[str]


class UpdateProjectStatusRequest(BaseModel):
    status: ProjectStatus
