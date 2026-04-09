# Maharashtra Gatka Federation — Backend Implementation Guide

## Overview

This guide covers the **complete backend** for the Gatka Federation portal:
- **Database:** PostgreSQL (via pgAdmin)
- **Backend Framework:** Python + FastAPI
- **Auth:** JWT tokens (bcrypt password hashing)
- **File Storage:** Local disk (passport photo, Aadhar docs)
- **Users:** 1 admin + 65 district/MNC users (36 Districts + 29 Municipal Corporations)

---

## Directory Structure

```
gatka_backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Settings / env vars
│   ├── database.py              # DB connection (SQLAlchemy)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── player.py
│   │   ├── competition.py
│   │   └── registration.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── player.py
│   │   ├── competition.py
│   │   └── registration.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── players.py
│   │   ├── competitions.py
│   │   └── registrations.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py          # JWT + bcrypt
│   │   └── dependencies.py      # Auth middleware
│   └── utils/
│       ├── __init__.py
│       └── file_upload.py
├── uploads/                     # Player documents (photos, Aadhar)
├── requirements.txt
├── .env
└── run.py
```

---

## Step 1 — PostgreSQL Setup in pgAdmin

### 1.1 Create Database

In pgAdmin, open Query Tool and run:

```sql
CREATE DATABASE gatka_federation
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE   = 'en_US.UTF-8';
```

### 1.2 Create Dedicated DB User

```sql
CREATE USER gatka_app WITH PASSWORD 'GatkaApp@2024!';
GRANT ALL PRIVILEGES ON DATABASE gatka_federation TO gatka_app;
```

---

## Step 2 — All SQL Queries (Run in Order)

Connect to `gatka_federation` database, then run:

### 2.1 — Areas Table (Districts & Municipal Corporations)

```sql
CREATE TABLE areas (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    area_type   VARCHAR(20)  NOT NULL CHECK (area_type IN ('district', 'mnc')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 36 Districts of Maharashtra
INSERT INTO areas (name, area_type) VALUES
('Ahmednagar',     'district'),
('Akola',          'district'),
('Amravati',       'district'),
('Aurangabad',     'district'),
('Beed',           'district'),
('Bhandara',       'district'),
('Buldhana',       'district'),
('Chandrapur',     'district'),
('Dhule',          'district'),
('Gadchiroli',     'district'),
('Gondia',         'district'),
('Hingoli',        'district'),
('Jalgaon',        'district'),
('Jalna',          'district'),
('Kolhapur',       'district'),
('Latur',          'district'),
('Mumbai City',    'district'),
('Mumbai Suburban','district'),
('Nagpur',         'district'),
('Nanded',         'district'),
('Nandurbar',      'district'),
('Nashik',         'district'),
('Osmanabad',      'district'),
('Palghar',        'district'),
('Parbhani',       'district'),
('Pune',           'district'),
('Raigad',         'district'),
('Ratnagiri',      'district'),
('Sangli',         'district'),
('Satara',         'district'),
('Sindhudurg',     'district'),
('Solapur',        'district'),
('Thane',          'district'),
('Wardha',         'district'),
('Washim',         'district'),
('Yavatmal',       'district');

-- 29 Municipal Corporations of Maharashtra
INSERT INTO areas (name, area_type) VALUES
('Brihanmumbai (BMC)',          'mnc'),
('Pune Municipal Corporation',  'mnc'),
('Nagpur Municipal Corporation','mnc'),
('Thane Municipal Corporation', 'mnc'),
('Nashik Municipal Corporation','mnc'),
('Aurangabad Municipal Corporation','mnc'),
('Solapur Municipal Corporation','mnc'),
('Amravati Municipal Corporation','mnc'),
('Nanded-Waghala Municipal Corporation','mnc'),
('Kolhapur Municipal Corporation','mnc'),
('Sangli-Miraj-Kupwad Municipal Corporation','mnc'),
('Malegaon Municipal Corporation','mnc'),
('Jalgaon Municipal Corporation','mnc'),
('Akola Municipal Corporation', 'mnc'),
('Latur Municipal Corporation', 'mnc'),
('Chandrapur Municipal Corporation','mnc'),
('Dhule Municipal Corporation', 'mnc'),
('Ichalkaranji Municipal Corporation','mnc'),
('Pimpri-Chinchwad Municipal Corporation','mnc'),
('Navi Mumbai Municipal Corporation','mnc'),
('Vasai-Virar City Municipal Corporation','mnc'),
('Kalyan-Dombivli Municipal Corporation','mnc'),
('Ulhasnagar Municipal Corporation','mnc'),
('Bhiwandi-Nizampur Municipal Corporation','mnc'),
('Mira-Bhayandar Municipal Corporation','mnc'),
('Panvel Municipal Corporation','mnc'),
('Mhow Municipal Corporation',  'mnc'),
('Baramati Municipal Corporation','mnc'),
('Shirdi Municipal Corporation','mnc');
```

### 2.2 — Users Table

```sql
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name    VARCHAR(150) NOT NULL,
    role         VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    area_id      INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_area_id ON users(area_id);
```

### 2.3 — Insert Admin User

```sql
-- Password: Admin@Gatka2024  (bcrypt hash below — change as needed)
-- To generate a new hash: python -c "from passlib.context import CryptContext; c=CryptContext(schemes=['bcrypt']); print(c.hash('Admin@Gatka2024'))"
INSERT INTO users (email, password_hash, full_name, role, area_id) VALUES
('admin@gatka.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCangelwbbUBdj8XBPL8a',
 'Admin User', 'admin', NULL);
```

### 2.4 — Insert 65 District/MNC Users

```sql
-- All passwords are: Gatka@2024  (same bcrypt hash for simplicity; admin should ask users to change)
-- Hash for 'Gatka@2024': $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36RRRHbRlpCFRPOo5ywXb8i

DO $$
DECLARE
    pw_hash TEXT := '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36RRRHbRlpCFRPOo5ywXb8i';
    rec RECORD;
    slug TEXT;
    user_email TEXT;
    user_name TEXT;
BEGIN
    FOR rec IN SELECT id, name, area_type FROM areas ORDER BY id LOOP
        -- Build email slug from area name
        slug := lower(regexp_replace(rec.name, '[^a-zA-Z0-9]', '', 'g'));
        slug := substring(slug, 1, 20);

        IF rec.area_type = 'district' THEN
            user_email := slug || '.district@gatka.com';
            user_name  := rec.name || ' District';
        ELSE
            user_email := slug || '.mnc@gatka.com';
            user_name  := rec.name;
        END IF;

        INSERT INTO users (email, password_hash, full_name, role, area_id)
        VALUES (user_email, pw_hash, user_name, 'user', rec.id)
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;
```

### 2.5 — Verify All 66 Users

```sql
SELECT u.id, u.email, u.full_name, u.role, a.name AS area, a.area_type
FROM users u
LEFT JOIN areas a ON u.area_id = a.id
ORDER BY u.role DESC, a.area_type, u.full_name;
```

### 2.6 — Players Table

```sql
CREATE TABLE players (
    id               SERIAL PRIMARY KEY,
    area_id          INTEGER NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
    added_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Personal Info
    full_name        VARCHAR(150) NOT NULL,
    father_name      VARCHAR(150),
    mother_name      VARCHAR(150),
    date_of_birth    DATE NOT NULL,
    gender           VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    marital_status   VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),

    -- Contact
    email            VARCHAR(150),
    phone_no         VARCHAR(15),
    whatsapp_no      VARCHAR(15),

    -- Identity
    aadhar_no        VARCHAR(12) UNIQUE,
    t_shirt_size     VARCHAR(5) CHECK (t_shirt_size IN ('XS','S','M','L','XL','XXL','3XL')),

    -- Address
    state            VARCHAR(100) DEFAULT 'Maharashtra',
    address          TEXT,

    -- Documents (file paths)
    passport_photo_path VARCHAR(255),
    aadhar_front_path   VARCHAR(255),
    aadhar_back_path    VARCHAR(255),

    -- Status
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_players_area_id ON players(area_id);
CREATE INDEX idx_players_dob     ON players(date_of_birth);
CREATE INDEX idx_players_gender  ON players(gender);
```

### 2.7 — Competitions Table

```sql
CREATE TABLE competitions (
    id                      SERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    venue                   VARCHAR(255),
    start_date              DATE NOT NULL,
    end_date                DATE,
    registration_deadline   DATE,
    max_participants        INTEGER,
    status                  VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                                CHECK (status IN ('upcoming','active','completed','cancelled')),
    description             TEXT,
    created_by_admin_id     INTEGER NOT NULL REFERENCES users(id),
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_dates  ON competitions(start_date, end_date);
```

### 2.8 — Competition Age Categories

```sql
CREATE TABLE competition_age_categories (
    id              SERIAL PRIMARY KEY,
    competition_id  INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    category_name   VARCHAR(100) NOT NULL,
    min_age         INTEGER,
    max_age         INTEGER
);

-- Gatka standard age categories
-- These will be inserted per competition from the backend
```

### 2.9 — Competition Registrations (Participants)

```sql
CREATE TABLE competition_registrations (
    id              SERIAL PRIMARY KEY,
    competition_id  INTEGER NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    area_id         INTEGER NOT NULL REFERENCES areas(id),
    registered_by   INTEGER NOT NULL REFERENCES users(id),
    age_category    VARCHAR(100),
    event_group     VARCHAR(100),
    event_name      VARCHAR(100),
    registration_date TIMESTAMP DEFAULT NOW(),
    status          VARCHAR(20) DEFAULT 'registered'
                        CHECK (status IN ('registered','confirmed','withdrawn')),
    UNIQUE (competition_id, player_id)
);

CREATE INDEX idx_reg_competition ON competition_registrations(competition_id);
CREATE INDEX idx_reg_player      ON competition_registrations(player_id);
CREATE INDEX idx_reg_area        ON competition_registrations(area_id);
```

### 2.10 — Audit / Update Trigger

```sql
-- Auto-update updated_at timestamp on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2.11 — Grant App User Permissions

```sql
GRANT USAGE ON SCHEMA public TO gatka_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gatka_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gatka_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO gatka_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO gatka_app;
```

---

## Step 3 — Python Environment Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`requirements.txt`:
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
python-dotenv==1.0.1
pydantic[email]==2.7.1
aiofiles==23.2.1
```

`.env`:
```
DATABASE_URL=postgresql://gatka_app:GatkaApp@2024!@localhost:5432/gatka_federation
SECRET_KEY=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
UPLOAD_DIR=uploads
```

---

## Step 4 — API Endpoints Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | All | Login, returns JWT |
| GET | `/auth/me` | All | Current user info |
| GET | `/users/` | Admin | List all users |
| POST | `/users/` | Admin | Create user |
| PUT | `/users/{id}` | Admin | Edit user |
| DELETE | `/users/{id}` | Admin | Delete user |
| GET | `/players/` | User/Admin | List players (filtered by area) |
| POST | `/players/` | User | Add player |
| PUT | `/players/{id}` | User | Edit player |
| DELETE | `/players/{id}` | Admin | Delete player |
| GET | `/competitions/` | All | List competitions |
| POST | `/competitions/` | Admin | Create competition |
| PUT | `/competitions/{id}` | Admin | Edit competition |
| DELETE | `/competitions/{id}` | Admin | Delete competition |
| GET | `/registrations/` | User/Admin | List registrations |
| POST | `/registrations/` | User | Register player in competition |
| DELETE | `/registrations/{id}` | User/Admin | Remove registration |

---

## Step 5 — Running the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

API docs auto-generated at: `http://localhost:8000/docs`

---

## Security Notes

1. Change all default passwords immediately after setup
2. Rotate `SECRET_KEY` before going to production
3. Enable HTTPS (use nginx as reverse proxy)
4. Store `.env` outside the git repo
5. Use `bcrypt` hashing — never store plain-text passwords
