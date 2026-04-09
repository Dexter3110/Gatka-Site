"""
Players router.
- District/MNC users can only add and view players in their own area.
- Admin can view all players across all areas.
"""

import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Player, Area
from app.schemas.schemas import PlayerCreate, PlayerUpdate, PlayerOut
from app.core.dependencies import get_current_user, require_admin
from app.config import settings

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"}


def _save_file(upload: UploadFile, subfolder: str) -> str:
    """Save an uploaded file to disk and return its relative path."""
    ext = os.path.splitext(upload.filename)[-1].lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    dir_path = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, filename)
    with open(file_path, "wb") as f:
        f.write(upload.file.read())
    return f"{subfolder}/{filename}"


@router.get("/", response_model=List[PlayerOut])
def list_players(
    search: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    - Regular users see only players in their area.
    - Admins see all players.
    """
    q = db.query(Player).filter(Player.is_active == is_active)

    if current_user.role != "admin":
        if not current_user.area_id:
            return []
        q = q.filter(Player.area_id == current_user.area_id)

    if search:
        q = q.filter(Player.full_name.ilike(f"%{search}%"))
    if gender:
        q = q.filter(Player.gender == gender)

    return q.order_by(Player.full_name).all()


@router.post("/", response_model=PlayerOut, status_code=status.HTTP_201_CREATED)
async def add_player(
    # Form fields mirroring AddPlayer.tsx
    full_name: str = Form(...),
    father_name: Optional[str] = Form(None),
    mother_name: Optional[str] = Form(None),
    date_of_birth: str = Form(...),       # "YYYY-MM-DD"
    gender: str = Form(...),
    marital_status: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_no: Optional[str] = Form(None),
    whatsapp_no: Optional[str] = Form(None),
    aadhar_no: Optional[str] = Form(None),
    t_shirt_size: Optional[str] = Form(None),
    state: str = Form("Maharashtra"),
    address: Optional[str] = Form(None),
    # File uploads
    passport_photo: Optional[UploadFile] = File(None),
    aadhar_front: Optional[UploadFile] = File(None),
    aadhar_back: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a player. User can only add players to their own area."""
    if current_user.role != "admin" and not current_user.area_id:
        raise HTTPException(status_code=403, detail="Your account is not linked to any area")

    area_id = current_user.area_id  # non-admin always uses their own area

    # Check duplicate Aadhar
    if aadhar_no:
        existing = db.query(Player).filter(Player.aadhar_no == aadhar_no).first()
        if existing:
            raise HTTPException(status_code=400, detail="Aadhar number already registered")

    # Save files
    photo_path = aadhar_f_path = aadhar_b_path = None
    if passport_photo and passport_photo.content_type in ALLOWED_IMAGE_TYPES:
        photo_path = _save_file(passport_photo, "photos")
    if aadhar_front and aadhar_front.content_type in ALLOWED_IMAGE_TYPES:
        aadhar_f_path = _save_file(aadhar_front, "aadhar")
    if aadhar_back and aadhar_back.content_type in ALLOWED_IMAGE_TYPES:
        aadhar_b_path = _save_file(aadhar_back, "aadhar")

    from datetime import date
    dob = date.fromisoformat(date_of_birth)

    player = Player(
        area_id=area_id,
        added_by_user_id=current_user.id,
        full_name=full_name,
        father_name=father_name,
        mother_name=mother_name,
        date_of_birth=dob,
        gender=gender,
        marital_status=marital_status,
        email=email,
        phone_no=phone_no,
        whatsapp_no=whatsapp_no,
        aadhar_no=aadhar_no,
        t_shirt_size=t_shirt_size,
        state=state,
        address=address,
        passport_photo_path=photo_path,
        aadhar_front_path=aadhar_f_path,
        aadhar_back_path=aadhar_b_path,
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}", response_model=PlayerOut)
def get_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Non-admin can only view their own area's players
    if current_user.role != "admin" and player.area_id != current_user.area_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return player


@router.put("/{player_id}", response_model=PlayerOut)
def update_player(
    player_id: int,
    payload: PlayerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    if current_user.role != "admin" and player.area_id != current_user.area_id:
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.is_active = False
    db.commit()
