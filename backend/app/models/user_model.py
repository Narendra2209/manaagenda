from datetime import datetime


def user_entity(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user.get("created_at", datetime.utcnow()).isoformat(),
    }


def users_entity(users: list) -> list:
    return [user_entity(u) for u in users]
