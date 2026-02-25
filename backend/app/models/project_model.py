from datetime import datetime


def project_entity(project: dict) -> dict:
    return {
        "id": str(project["_id"]),
        "name": project["name"],
        "description": project["description"],
        "client_id": str(project["client_id"]),
        "service_request_id": str(project["service_request_id"]),
        "employee_ids": [str(eid) for eid in project.get("employee_ids", [])],
        "status": project["status"],
        "created_at": project.get("created_at", datetime.utcnow()).isoformat(),
    }


def projects_entity(projects: list) -> list:
    return [project_entity(p) for p in projects]
