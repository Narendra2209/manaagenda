from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status

from app.db.mongodb import get_database
from app.models.project_model import project_entity, projects_entity


async def create_project(
    name: str,
    description: str,
    client_id: str,
    service_request_id: str,
) -> dict:
    db = get_database()
    project_doc = {
        "name": name,
        "description": description,
        "client_id": ObjectId(client_id),
        "service_request_id": ObjectId(service_request_id),
        "employee_ids": [],
        "status": "NOT_STARTED",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.projects.insert_one(project_doc)
    project_doc["_id"] = result.inserted_id
    return project_entity(project_doc)


async def get_all_projects() -> list:
    db = get_database()
    projects = await db.projects.find().to_list(1000)
    return projects_entity(projects)


async def get_projects_by_client(client_id: str) -> list:
    db = get_database()
    projects = await db.projects.find(
        {"client_id": ObjectId(client_id)}
    ).to_list(1000)
    return projects_entity(projects)


async def get_projects_by_employee(employee_id: str) -> list:
    db = get_database()
    projects = await db.projects.find(
        {"employee_ids": ObjectId(employee_id)}
    ).to_list(1000)
    return projects_entity(projects)


async def assign_employees(project_id: str, employee_ids: list) -> dict:
    db = get_database()
    obj_employee_ids = [ObjectId(eid) for eid in employee_ids]

    result = await db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": {"employee_ids": obj_employee_ids}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project_entity(result)


async def update_project_status(project_id: str, new_status: str) -> dict:
    db = get_database()
    result = await db.projects.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": {"status": new_status}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project_entity(result)
