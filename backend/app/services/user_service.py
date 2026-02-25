from bson import ObjectId

from app.db.mongodb import get_database
from app.models.user_model import user_entity, users_entity


async def get_all_users() -> list:
    db = get_database()
    users = await db.users.find().to_list(1000)
    return users_entity(users)


async def get_users_by_role(role: str) -> list:
    db = get_database()
    users = await db.users.find({"role": role}).to_list(1000)
    return users_entity(users)


async def get_user_by_id(user_id: str) -> dict:
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        return user_entity(user)
    return None
