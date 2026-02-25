from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List

from app.core.security import get_current_admin
from app.db.mongodb import get_database
from app.schemas.user_schema import UserCreate, UserResponse
from app.schemas.service_schema import ServiceCreate, ServiceResponse, ServiceRequestResponse
from app.schemas.project_schema import (
    ProjectResponse,
    AssignEmployeesRequest,
)
from app.services.auth_service import register_user
from app.services.user_service import get_all_users, get_users_by_role
from app.services.project_service import (
    create_project,
    get_all_projects,
    assign_employees,
)
from app.models.service_model import (
    service_entity,
    services_entity,
    service_request_entity,
    service_requests_entity,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Users ────────────────────────────────────────────
@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, admin: dict = Depends(get_current_admin)):
    return await register_user(user.name, user.email, user.password, user.role)


@router.get("/users", response_model=List[UserResponse])
async def list_users(admin: dict = Depends(get_current_admin)):
    return await get_all_users()


@router.get("/users/employees", response_model=List[UserResponse])
async def list_employees(admin: dict = Depends(get_current_admin)):
    return await get_users_by_role("EMPLOYEE")


@router.get("/users/clients", response_model=List[UserResponse])
async def list_clients(admin: dict = Depends(get_current_admin)):
    return await get_users_by_role("CLIENT")


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["role"] == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot delete admin users")

    # Remove from all assigned projects
    await db.projects.update_many(
        {"assigned_employees": user_id},
        {"$pull": {"assigned_employees": user_id}},
    )

    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}


# ── Services ─────────────────────────────────────────
@router.post("/services", response_model=ServiceResponse)
async def create_service(
    service: ServiceCreate, admin: dict = Depends(get_current_admin)
):
    db = get_database()
    service_doc = {
        "name": service.name,
        "description": service.description,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.services.insert_one(service_doc)
    service_doc["_id"] = result.inserted_id
    return service_entity(service_doc)


@router.get("/services", response_model=List[ServiceResponse])
async def list_services(admin: dict = Depends(get_current_admin)):
    db = get_database()
    services = await db.services.find().to_list(1000)
    return services_entity(services)


# ── Service Requests ─────────────────────────────────
@router.get("/service-requests", response_model=List[ServiceRequestResponse])
async def list_service_requests(admin: dict = Depends(get_current_admin)):
    db = get_database()
    requests = await db.service_requests.find().to_list(1000)
    return service_requests_entity(requests)


@router.put("/service-requests/{request_id}/approve")
async def approve_service_request(
    request_id: str, admin: dict = Depends(get_current_admin)
):
    db = get_database()
    req = await db.service_requests.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    if req["status"] != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending",
        )

    # Update request status
    await db.service_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "APPROVED"}},
    )

    # Fetch service name for project
    service = await db.services.find_one({"_id": req["service_id"]})
    service_name = service["name"] if service else "Service"

    # Auto-create project
    project = await create_project(
        name=f"Project - {service_name}",
        description=f"Auto-created from approved service request",
        client_id=str(req["client_id"]),
        service_request_id=request_id,
    )

    return {"message": "Request approved and project created", "project": project}


@router.put("/service-requests/{request_id}/reject")
async def reject_service_request(
    request_id: str, admin: dict = Depends(get_current_admin)
):
    db = get_database()
    req = await db.service_requests.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found",
        )

    await db.service_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "REJECTED"}},
    )
    return {"message": "Request rejected"}


# ── Projects ─────────────────────────────────────────
@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(admin: dict = Depends(get_current_admin)):
    return await get_all_projects()


@router.put("/projects/{project_id}/assign", response_model=ProjectResponse)
async def assign_employees_to_project(
    project_id: str,
    body: AssignEmployeesRequest,
    admin: dict = Depends(get_current_admin),
):
    return await assign_employees(project_id, body.employee_ids)


@router.put("/projects/{project_id}/unassign")
async def unassign_employee_from_project(
    project_id: str,
    body: dict,
    admin: dict = Depends(get_current_admin),
):
    db = get_database()
    employee_id = body.get("employee_id")
    if not employee_id:
        raise HTTPException(status_code=400, detail="employee_id is required")

    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$pull": {"assigned_employees": employee_id}},
    )
    return {"message": "Employee unassigned successfully"}


# ── Dashboard Stats ──────────────────────────────────
@router.get("/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    db = get_database()
    total_users = await db.users.count_documents({})
    total_employees = await db.users.count_documents({"role": "EMPLOYEE"})
    total_clients = await db.users.count_documents({"role": "CLIENT"})
    total_projects = await db.projects.count_documents({})
    total_services = await db.services.count_documents({})
    pending_requests = await db.service_requests.count_documents({"status": "PENDING"})
    active_projects = await db.projects.count_documents({"status": "IN_PROGRESS"})
    completed_projects = await db.projects.count_documents({"status": "COMPLETED"})

    return {
        "total_users": total_users,
        "total_employees": total_employees,
        "total_clients": total_clients,
        "total_projects": total_projects,
        "total_services": total_services,
        "pending_requests": pending_requests,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
    }
