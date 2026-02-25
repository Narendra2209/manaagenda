from datetime import datetime


def message_entity(message: dict) -> dict:
    return {
        "id": str(message["_id"]),
        "sender_id": str(message["sender_id"]),
        "receiver_id": str(message["receiver_id"]),
        "content": message["content"],
        "created_at": message.get("created_at", datetime.utcnow()).isoformat(),
    }


def messages_entity(messages: list) -> list:
    return [message_entity(m) for m in messages]
