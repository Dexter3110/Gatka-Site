"""
Pydantic v2 schemas for all request bodies and responses.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime


# ─────────────────────────── Auth ───────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def must_be_gatka_email(cls, v):
        if not v.endswith("@gatka.com"):
            raise ValueError("Only @gatka.com emails are allowed")
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    area_id: Optional[int]
    area_name: Optional[str]


# ─────────────────────────── Area ───────────────────────────

class AreaOut(BaseModel):
    id: int
    name: str
    area_type: str

    model_config = {"from_attributes": True}


# ─────────────────────────── User ───────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "user"
    area_id: Optional[int] = None

    @field_validator("email")
    @classmethod
    def must_be_gatka_email(cls, v):
        if not v.endswith("@gatka.com"):
            raise ValueError("Only @gatka.com emails are allowed")
        return v.lower()

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        if v not in ("admin", "user"):
            raise ValueError("Role must be 'admin' or 'user'")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    area_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    area_id: Optional[int]
    area: Optional[AreaOut]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── Player ───────────────────────────

class PlayerCreate(BaseModel):
    full_name: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: date
    gender: str
    marital_status: Optional[str] = None
    email: Optional[str] = None
    phone_no: Optional[str] = None
    whatsapp_no: Optional[str] = None
    aadhar_no: Optional[str] = None
    t_shirt_size: Optional[str] = None
    state: str = "Maharashtra"
    address: Optional[str] = None

    @field_validator("gender")
    @classmethod
    def valid_gender(cls, v):
        if v not in ("male", "female", "other"):
            raise ValueError("Gender must be male, female, or other")
        return v


class PlayerUpdate(BaseModel):
    full_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    email: Optional[str] = None
    phone_no: Optional[str] = None
    whatsapp_no: Optional[str] = None
    aadhar_no: Optional[str] = None
    t_shirt_size: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class PlayerOut(BaseModel):
    id: int
    area_id: int
    area: Optional[AreaOut]
    full_name: str
    father_name: Optional[str]
    mother_name: Optional[str]
    date_of_birth: date
    gender: str
    marital_status: Optional[str]
    email: Optional[str]
    phone_no: Optional[str]
    whatsapp_no: Optional[str]
    aadhar_no: Optional[str]
    t_shirt_size: Optional[str]
    state: Optional[str]
    address: Optional[str]
    passport_photo_path: Optional[str]
    aadhar_front_path: Optional[str]
    aadhar_back_path: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── Competition ───────────────────────────

class AgeCategoryCreate(BaseModel):
    category_name: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None


class AgeCategoryOut(BaseModel):
    id: int
    category_name: str
    min_age: Optional[int]
    max_age: Optional[int]

    model_config = {"from_attributes": True}


class CompetitionCreate(BaseModel):
    name: str
    venue: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    registration_deadline: Optional[date] = None
    max_participants: Optional[int] = None
    status: str = "upcoming"
    description: Optional[str] = None
    age_categories: List[AgeCategoryCreate] = []


class CompetitionUpdate(BaseModel):
    name: Optional[str] = None
    venue: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    registration_deadline: Optional[date] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    age_categories: Optional[List[AgeCategoryCreate]] = None


class CompetitionOut(BaseModel):
    id: int
    name: str
    venue: Optional[str]
    start_date: date
    end_date: Optional[date]
    registration_deadline: Optional[date]
    max_participants: Optional[int]
    status: str
    description: Optional[str]
    age_categories: List[AgeCategoryOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── Registration ───────────────────────────

class RegistrationCreate(BaseModel):
    competition_id: int
    player_id: int
    age_category: Optional[str] = None
    event_group: Optional[str] = None
    event_name: Optional[str] = None


class RegistrationOut(BaseModel):
    id: int
    competition_id: int
    player_id: int
    area_id: int
    age_category: Optional[str]
    event_group: Optional[str]
    event_name: Optional[str]
    status: str
    registration_date: datetime
    player: Optional[PlayerOut]

    model_config = {"from_attributes": True}
