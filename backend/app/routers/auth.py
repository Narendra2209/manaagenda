from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.schemas.user_schema import UserLogin, TokenResponse
from app.core.security import get_current_user, hash_password, verify_password
from app.db.mongodb import get_database
from app.services.auth_service import authenticate_user
from app.models.user_model import user_entity

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(form_data: UserLogin):
    result = await authenticate_user(form_data.email, form_data.password)
    return result


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
    }


@router.put("/profile")
async def update_profile(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    update_data = {}

    if "name" in body and body["name"].strip():
        update_data["name"] = body["name"].strip()

    if "email" in body and body["email"].strip():
        existing = await db.users.find_one({"email": body["email"], "_id": {"$ne": ObjectId(current_user["_id"])}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = body["email"].strip()

    if "current_password" in body and "new_password" in body:
        user_doc = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        if not verify_password(body["current_password"], user_doc["password"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        update_data["password"] = hash_password(body["new_password"])

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )

    updated = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    return user_entity(updated)
