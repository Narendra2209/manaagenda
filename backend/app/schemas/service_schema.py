from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ServiceCreate(BaseModel):
    name: str
    description: str


class ServiceResponse(BaseModel):
    id: str
    name: str
    description: str
    created_at: str


class ServiceRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ServiceRequestCreate(BaseModel):
    service_id: str


class ServiceRequestResponse(BaseModel):
    id: str
    client_id: str
    service_id: str
    status: str
    created_at: str
