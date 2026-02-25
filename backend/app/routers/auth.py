from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user_schema import UserLogin, TokenResponse
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(form_data: UserLogin):
    result = await authenticate_user(form_data.email, form_data.password)
    return result
