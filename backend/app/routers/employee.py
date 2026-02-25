from fastapi import APIRouter, Depends
from typing import List

from app.core.security import get_current_employee
from app.schemas.project_schema import ProjectResponse, UpdateProjectStatusRequest
from app.services.project_service import get_projects_by_employee, update_project_status

router = APIRouter(prefix="/api/employee", tags=["Employee"])


@router.get("/projects", response_model=List[ProjectResponse])
async def my_projects(employee: dict = Depends(get_current_employee)):
    return await get_projects_by_employee(employee["_id"])


@router.put("/projects/{project_id}/status", response_model=ProjectResponse)
async def change_project_status(
    project_id: str,
    body: UpdateProjectStatusRequest,
    employee: dict = Depends(get_current_employee),
):
    return await update_project_status(project_id, body.status)
