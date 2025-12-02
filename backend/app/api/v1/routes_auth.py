from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import authenticate_user
from app.api.deps import get_db_session

router = APIRouter()


@router.post("/login", response_model=Token, summary="Login and get access token")
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
):
    user = await authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
    )
    return Token(access_token=token)
