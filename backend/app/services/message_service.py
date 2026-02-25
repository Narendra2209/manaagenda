from datetime import datetime, timezone
from bson import ObjectId

from app.db.mongodb import get_database
from app.models.message_model import message_entity, messages_entity


async def send_message(sender_id: str, receiver_id: str, content: str) -> dict:
    db = get_database()
    message_doc = {
        "sender_id": ObjectId(sender_id),
        "receiver_id": ObjectId(receiver_id),
        "content": content,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.messages.insert_one(message_doc)
    message_doc["_id"] = result.inserted_id
    return message_entity(message_doc)


async def get_user_messages(user_id: str) -> list:
    db = get_database()
    oid = ObjectId(user_id)
    messages = await db.messages.find(
        {"$or": [{"sender_id": oid}, {"receiver_id": oid}]}
    ).sort("created_at", 1).to_list(1000)
    return messages_entity(messages)
