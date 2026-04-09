"""
Registrations router.
- Users register players (from their own area) into a competition.
- Admin can view all registrations; users see only their area's registrations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Player, Competition, CompetitionRegistration
from app.schemas.schemas import RegistrationCreate, RegistrationOut
from app.core.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[RegistrationOut])
def list_registrations(
    competition_id: Optional[int] = Query(None),
    area_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(CompetitionRegistration)

    if current_user.role != "admin":
        # Non-admin sees only their own area's registrations
        q = q.filter(CompetitionRegistration.area_id == current_user.area_id)
    elif area_id:
        q = q.filter(CompetitionRegistration.area_id == area_id)

    if competition_id:
        q = q.filter(CompetitionRegistration.competition_id == competition_id)

    return q.order_by(CompetitionRegistration.registration_date.desc()).all()


@router.post("/", response_model=RegistrationOut, status_code=status.HTTP_201_CREATED)
def register_player(
    payload: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a player for a competition."""
    # Verify competition exists and is open
    competition = db.query(Competition).filter(Competition.id == payload.competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    if competition.status not in ("upcoming", "active"):
        raise HTTPException(status_code=400, detail="Competition is not open for registrations")

    # Verify player exists
    player = db.query(Player).filter(Player.id == payload.player_id, Player.is_active == True).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Non-admin can only register players from their own area
    if current_user.role != "admin" and player.area_id != current_user.area_id:
        raise HTTPException(
            status_code=403,
            detail="You can only register players from your own area"
        )

    # Check for duplicate registration
    existing = db.query(CompetitionRegistration).filter(
        CompetitionRegistration.competition_id == payload.competition_id,
        CompetitionRegistration.player_id == payload.player_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Player already registered for this competition")

    # Check participant limit
    if competition.max_participants:
        count = db.query(CompetitionRegistration).filter(
            CompetitionRegistration.competition_id == payload.competition_id
        ).count()
        if count >= competition.max_participants:
            raise HTTPException(status_code=400, detail="Competition has reached maximum participants")

    reg = CompetitionRegistration(
        competition_id=payload.competition_id,
        player_id=payload.player_id,
        area_id=player.area_id,
        registered_by=current_user.id,
        age_category=payload.age_category,
        event_group=payload.event_group,
        event_name=payload.event_name,
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.delete("/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reg = db.query(CompetitionRegistration).filter(
        CompetitionRegistration.id == registration_id
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Non-admin can only remove registrations from their area
    if current_user.role != "admin" and reg.area_id != current_user.area_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(reg)
    db.commit()


@router.get("/summary")
def registration_summary(
    competition_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary sheet: returns registration counts grouped by area.
    Admin sees all; users see only their area.
    """
    from sqlalchemy import func
    from app.models.models import Area

    q = (
        db.query(
            Area.name.label("area_name"),
            Area.area_type,
            func.count(CompetitionRegistration.id).label("total"),
        )
        .join(CompetitionRegistration, CompetitionRegistration.area_id == Area.id)
        .filter(CompetitionRegistration.competition_id == competition_id)
    )

    if current_user.role != "admin":
        q = q.filter(CompetitionRegistration.area_id == current_user.area_id)

    rows = q.group_by(Area.name, Area.area_type).all()
    return [{"area": r.area_name, "area_type": r.area_type, "total": r.total} for r in rows]
