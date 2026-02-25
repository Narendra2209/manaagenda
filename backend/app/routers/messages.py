from fastapi import APIRouter, Depends
from typing import List

from app.core.security import get_current_user
from app.db.mongodb import get_database
from app.schemas.message_schema import MessageCreate, MessageResponse
from app.services.message_service import send_message, get_user_messages
from app.models.user_model import user_entity

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse)
async def create_message(
    body: MessageCreate, current_user: dict = Depends(get_current_user)
):
    return await send_message(current_user["_id"], body.receiver_id, body.content)


@router.get("/", response_model=List[MessageResponse])
async def list_messages(current_user: dict = Depends(get_current_user)):
    return await get_user_messages(current_user["_id"])


@router.get("/contacts")
async def get_contacts(current_user: dict = Depends(get_current_user)):
    """Get available contacts based on user role."""
    db = get_database()
    role = current_user["role"]
    contacts = []

    if role == "ADMIN":
        # Admin can message everyone
        users = await db.users.find({"role": {"$in": ["EMPLOYEE", "CLIENT"]}}).to_list(1000)
        contacts = [user_entity(u) for u in users]
    elif role == "EMPLOYEE":
        # Employees can message admin and clients of assigned projects
        admins = await db.users.find({"role": "ADMIN"}).to_list(100)
        contacts = [user_entity(u) for u in admins]
        # Find projects this employee is assigned to
        projects = await db.projects.find(
            {"assigned_employees": current_user["_id"]}
        ).to_list(1000)
        client_ids_set = set()
        for p in projects:
            if p.get("client_id"):
                client_ids_set.add(p["client_id"])
        # Add those clients
        from bson import ObjectId
        for cid in client_ids_set:
            try:
                client = await db.users.find_one({"_id": ObjectId(cid)})
                if client:
                    contacts.append(user_entity(client))
            except Exception:
                pass
    elif role == "CLIENT":
        # Clients can message admin + assigned employees
        admins = await db.users.find({"role": "ADMIN"}).to_list(100)
        contacts = [user_entity(u) for u in admins]
        # Find projects for this client
        projects = await db.projects.find(
            {"client_id": current_user["_id"]}
        ).to_list(1000)
        emp_ids_set = set()
        for p in projects:
            for eid in p.get("assigned_employees", []):
                emp_ids_set.add(eid)
        from bson import ObjectId
        for eid in emp_ids_set:
            try:
                emp = await db.users.find_one({"_id": ObjectId(eid)})
                if emp:
                    contacts.append(user_entity(emp))
            except Exception:
                pass

    return contacts
