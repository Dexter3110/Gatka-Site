"""
Authentication router — handles login and returns JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Area
from app.schemas.schemas import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == payload.email,
        User.is_active == True
    ).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": str(user.id)})

    area_name = None
    if user.area_id:
        area = db.query(Area).filter(Area.id == user.area_id).first()
        area_name = area.name if area else None

    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
        area_id=user.area_id,
        area_name=area_name,
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "area_id": current_user.area_id,
        "is_active": current_user.is_active,
    }
