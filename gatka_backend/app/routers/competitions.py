"""
Competitions router.
- Admin creates, edits, deletes competitions.
- All authenticated users can list/view competitions.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, Competition, CompetitionAgeCategory
from app.schemas.schemas import CompetitionCreate, CompetitionUpdate, CompetitionOut
from app.core.dependencies import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[CompetitionOut])
def list_competitions(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return all competitions visible to all logged-in users."""
    q = db.query(Competition)
    if status_filter:
        q = q.filter(Competition.status == status_filter)
    return q.order_by(Competition.start_date.desc()).all()


@router.post("/", response_model=CompetitionOut, status_code=status.HTTP_201_CREATED)
def create_competition(
    payload: CompetitionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin creates a competition with optional age categories."""
    competition = Competition(
        name=payload.name,
        venue=payload.venue,
        start_date=payload.start_date,
        end_date=payload.end_date,
        registration_deadline=payload.registration_deadline,
        max_participants=payload.max_participants,
        status=payload.status,
        description=payload.description,
        created_by_admin_id=admin.id,
    )
    db.add(competition)
    db.flush()  # get competition.id before adding categories

    for cat in payload.age_categories:
        db.add(CompetitionAgeCategory(
            competition_id=competition.id,
            category_name=cat.category_name,
            min_age=cat.min_age,
            max_age=cat.max_age,
        ))

    db.commit()
    db.refresh(competition)
    return competition


@router.get("/{competition_id}", response_model=CompetitionOut)
def get_competition(
    competition_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    return comp


@router.put("/{competition_id}", response_model=CompetitionOut)
def update_competition(
    competition_id: int,
    payload: CompetitionUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")

    for field, value in payload.model_dump(exclude_none=True, exclude={"age_categories"}).items():
        setattr(comp, field, value)

    # Replace age categories if provided
    if payload.age_categories is not None:
        db.query(CompetitionAgeCategory).filter(
            CompetitionAgeCategory.competition_id == competition_id
        ).delete()
        for cat in payload.age_categories:
            db.add(CompetitionAgeCategory(
                competition_id=comp.id,
                category_name=cat.category_name,
                min_age=cat.min_age,
                max_age=cat.max_age,
            ))

    db.commit()
    db.refresh(comp)
    return comp


@router.delete("/{competition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_competition(
    competition_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    db.delete(comp)
    db.commit()
