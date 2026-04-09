"""
SQLAlchemy ORM models — maps to the PostgreSQL tables created by the SQL script.
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Text,
    ForeignKey, CheckConstraint, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.database import Base


class Area(Base):
    __tablename__ = "areas"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(150), unique=True, nullable=False)
    area_type  = Column(String(20), nullable=False)  # 'district' or 'mnc'
    created_at = Column(DateTime, default=func.now())

    __table_args__ = (
        CheckConstraint("area_type IN ('district','mnc')", name="ck_areas_type"),
    )

    users   = relationship("User", back_populates="area")
    players = relationship("Player", back_populates="area")


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    full_name     = Column(String(150), nullable=False)
    role          = Column(String(10), nullable=False, default="user")
    area_id       = Column(Integer, ForeignKey("areas.id", ondelete="SET NULL"), nullable=True)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=func.now())
    updated_at    = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('admin','user')", name="ck_users_role"),
    )

    area = relationship("Area", back_populates="users")
    players_added = relationship("Player", back_populates="added_by_user")
    registrations_done = relationship("CompetitionRegistration", back_populates="registered_by_user")


class Player(Base):
    __tablename__ = "players"

    id               = Column(Integer, primary_key=True, index=True)
    area_id          = Column(Integer, ForeignKey("areas.id", ondelete="RESTRICT"), nullable=False)
    added_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    # Personal
    full_name      = Column(String(150), nullable=False)
    father_name    = Column(String(150))
    mother_name    = Column(String(150))
    date_of_birth  = Column(Date, nullable=False)
    gender         = Column(String(10), nullable=False)
    marital_status = Column(String(20))

    # Contact
    email       = Column(String(150))
    phone_no    = Column(String(15))
    whatsapp_no = Column(String(15))

    # Identity
    aadhar_no    = Column(String(12), unique=True)
    t_shirt_size = Column(String(5))

    # Address
    state   = Column(String(100), default="Maharashtra")
    address = Column(Text)

    # Documents
    passport_photo_path = Column(String(255))
    aadhar_front_path   = Column(String(255))
    aadhar_back_path    = Column(String(255))

    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("gender IN ('male','female','other')", name="ck_players_gender"),
    )

    area          = relationship("Area", back_populates="players")
    added_by_user = relationship("User", back_populates="players_added")
    registrations = relationship("CompetitionRegistration", back_populates="player")


class Competition(Base):
    __tablename__ = "competitions"

    id                    = Column(Integer, primary_key=True, index=True)
    name                  = Column(String(255), nullable=False)
    venue                 = Column(String(255))
    start_date            = Column(Date, nullable=False)
    end_date              = Column(Date)
    registration_deadline = Column(Date)
    max_participants      = Column(Integer)
    status                = Column(String(20), nullable=False, default="upcoming")
    description           = Column(Text)
    created_by_admin_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at            = Column(DateTime, default=func.now())
    updated_at            = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('upcoming','active','completed','cancelled')",
            name="ck_competitions_status"
        ),
    )

    age_categories = relationship("CompetitionAgeCategory", back_populates="competition",
                                  cascade="all, delete-orphan")
    registrations  = relationship("CompetitionRegistration", back_populates="competition")


class CompetitionAgeCategory(Base):
    __tablename__ = "competition_age_categories"

    id             = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)
    category_name  = Column(String(100), nullable=False)
    min_age        = Column(Integer)
    max_age        = Column(Integer)

    competition = relationship("Competition", back_populates="age_categories")


class CompetitionRegistration(Base):
    __tablename__ = "competition_registrations"

    id             = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)
    player_id      = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    area_id        = Column(Integer, ForeignKey("areas.id"), nullable=False)
    registered_by  = Column(Integer, ForeignKey("users.id"), nullable=False)
    age_category   = Column(String(100))
    event_group    = Column(String(100))
    event_name     = Column(String(100))
    registration_date = Column(DateTime, default=func.now())
    status         = Column(String(20), default="registered")

    __table_args__ = (
        UniqueConstraint("competition_id", "player_id", name="uq_comp_player"),
        CheckConstraint(
            "status IN ('registered','confirmed','withdrawn')",
            name="ck_reg_status"
        ),
    )

    competition        = relationship("Competition", back_populates="registrations")
    player             = relationship("Player", back_populates="registrations")
    registered_by_user = relationship("User", back_populates="registrations_done")
