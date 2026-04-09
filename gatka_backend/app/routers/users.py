"""
Users router — admin-only CRUD for managing the 65 district/MNC accounts.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Area
from app.schemas.schemas import UserCreate, UserUpdate, UserOut
from app.core.dependencies import require_admin, get_current_user
from app.core.security import hash_password

router = APIRouter()


@router.get("/", response_model=List[UserOut])
def list_users(
    role: Optional[str] = Query(None),
    area_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all users. Filterable by role or area_type."""
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if area_type:
        q = q.join(Area).filter(Area.area_type == area_type)
    return q.order_by(User.full_name).all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Create a new user account (admin only)."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.area_id:
        area = db.query(Area).filter(Area.id == payload.area_id).first()
        if not area:
            raise HTTPException(status_code=404, detail="Area not found")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        area_id=payload.area_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Update user details. Used by admin to reset passwords, activate/deactivate, etc."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.password is not None:
        user.password_hash = hash_password(payload.password)
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.area_id is not None:
        user.area_id = payload.area_id

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Soft-delete: deactivates the user instead of removing the record."""
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()


@router.get("/areas/list")
def list_areas(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Return all districts and MNCs — used in dropdowns."""
    areas = db.query(Area).order_by(Area.area_type, Area.name).all()
    return [{"id": a.id, "name": a.name, "area_type": a.area_type} for a in areas]
