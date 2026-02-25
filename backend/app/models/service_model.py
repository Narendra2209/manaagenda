from datetime import datetime


def service_entity(service: dict) -> dict:
    return {
        "id": str(service["_id"]),
        "name": service["name"],
        "description": service["description"],
        "created_at": service.get("created_at", datetime.utcnow()).isoformat(),
    }


def services_entity(services: list) -> list:
    return [service_entity(s) for s in services]


def service_request_entity(request: dict) -> dict:
    return {
        "id": str(request["_id"]),
        "client_id": str(request["client_id"]),
        "service_id": str(request["service_id"]),
        "status": request["status"],
        "created_at": request.get("created_at", datetime.utcnow()).isoformat(),
    }


def service_requests_entity(requests: list) -> list:
    return [service_request_entity(r) for r in requests]
