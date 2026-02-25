from datetime import datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId

from app.db.mongodb import get_database
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user_model import user_entity


async def authenticate_user(email: str, password: str) -> dict:
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": str(user["_id"]),
        "name": user["name"],
    }


async def register_user(name: str, email: str, password: str, role: str) -> dict:
    db = get_database()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user_doc = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_entity(user_doc)
