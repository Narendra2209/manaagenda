from fastapi import APIRouter, Depends
from typing import List

from app.core.security import get_current_user
from app.schemas.message_schema import MessageCreate, MessageResponse
from app.services.message_service import send_message, get_user_messages

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse)
async def create_message(
    body: MessageCreate, current_user: dict = Depends(get_current_user)
):
    return await send_message(current_user["_id"], body.receiver_id, body.content)


@router.get("/", response_model=List[MessageResponse])
async def list_messages(current_user: dict = Depends(get_current_user)):
    return await get_user_messages(current_user["_id"])
