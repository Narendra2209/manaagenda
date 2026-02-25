from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from bson import ObjectId
from typing import List

from app.core.security import get_current_client
from app.db.mongodb import get_database
from app.schemas.service_schema import (
    ServiceRequestCreate,
    ServiceRequestResponse,
    ServiceResponse,
)
from app.schemas.project_schema import ProjectResponse
from app.services.project_service import get_projects_by_client
from app.models.service_model import (
    services_entity,
    service_request_entity,
    service_requests_entity,
)

router = APIRouter(prefix="/api/client", tags=["Client"])


@router.get("/services", response_model=List[ServiceResponse])
async def list_available_services(client: dict = Depends(get_current_client)):
    db = get_database()
    services = await db.services.find().to_list(1000)
    return services_entity(services)


@router.post("/service-requests", response_model=ServiceRequestResponse)
async def request_service(
    body: ServiceRequestCreate, client: dict = Depends(get_current_client)
):
    db = get_database()
    request_doc = {
        "client_id": ObjectId(client["_id"]),
        "service_id": ObjectId(body.service_id),
        "status": "PENDING",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.service_requests.insert_one(request_doc)
    request_doc["_id"] = result.inserted_id
    return service_request_entity(request_doc)


@router.get("/service-requests", response_model=List[ServiceRequestResponse])
async def my_service_requests(client: dict = Depends(get_current_client)):
    db = get_database()
    requests = await db.service_requests.find(
        {"client_id": ObjectId(client["_id"])}
    ).to_list(1000)
    return service_requests_entity(requests)


@router.get("/projects", response_model=List[ProjectResponse])
async def my_projects(client: dict = Depends(get_current_client)):
    return await get_projects_by_client(client["_id"])
