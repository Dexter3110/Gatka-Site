# Maharashtra Gatka Federation — Backend

## Quick Start (5 Steps)

### Step 1 — PostgreSQL Setup in pgAdmin

1. Open pgAdmin → right-click **Databases** → Create → Database
2. Name it: `gatka_site`
3. Open **Query Tool** for that database
4. Run the entire `database_setup.sql` file (File → Open → select it → ▶ Execute)

> This creates all tables, inserts all 65 area accounts + 1 admin, and sets up triggers.

---

### Step 2 — Generate Fresh Password Hashes

The SQL file ships with example hashes. Before going live, generate fresh ones:

```bash
pip install passlib[bcrypt]
python generate_hashes.py
```

Copy the printed hashes into `database_setup.sql` sections 3 and 4 before running.

---

### Step 3 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://gatka_app:YOUR_DB_PASSWORD@localhost:5432/gatka_federation
SECRET_KEY=your_64_char_random_string_here
```

Generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

### Step 4 — Install Python Dependencies & Run

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Server starts at: **http://localhost:8000**
Swagger UI docs: **http://localhost:8000/docs**

---

### Step 5 — Connect Frontend

Copy `frontend_api_integration.ts` to your React project at `src/api/api.ts`.

Add to your `.env` (Vite):
```
VITE_API_URL=http://localhost:8000
```

Replace the mock `handleSubmit` in `App.tsx` with the real API call shown at the bottom of `frontend_api_integration.ts`.

---

## User Credentials (Default)

| Account | Email | Default Password |
|---------|-------|-----------------|
| Admin | `admin@gatka.com` | `Admin@Gatka2024` |
| Districts (36) | `<name>.district@gatka.com` | `Gatka@2024` |
| MNCs (29) | `<name>.mnc@gatka.com` | `Gatka@2024` |

### Email Examples
| Area | Email |
|------|-------|
| Pune District | `pune.district@gatka.com` |
| Nagpur District | `nagpur.district@gatka.com` |
| Brihanmumbai (BMC) | `brihanmumbaibmc.mnc@gatka.com` |
| Pimpri-Chinchwad | `pimprichinchwad.mnc@gatka.com` |

> See the full list by running Section 5 of `database_setup.sql` in pgAdmin.

---

## Architecture

```
Login (JWT)
    │
    ├─ Admin ──────────────────────────────────────────────────────┐
    │   ├── Create/Edit/Delete Competitions                        │
    │   ├── Manage all 65 User accounts (reset passwords, etc.)    │
    │   ├── View ALL players across Maharashtra                    │
    │   └── View ALL competition registrations                     │
    │                                                              │
    └─ District / MNC User ────────────────────────────────────────┘
        ├── Add players (only in their own area)
        ├── View players (only their own area)
        ├── Register their players in any open competition
        └── View competitions (read-only, all competitions)
```

---

## Directory Structure

```
gatka_backend/
├── app/
│   ├── main.py              ← FastAPI app, CORS, routers
│   ├── config.py            ← Settings from .env
│   ├── database.py          ← SQLAlchemy engine + session
│   ├── models/
│   │   └── models.py        ← ORM models (Area, User, Player, Competition, Registration)
│   ├── schemas/
│   │   └── schemas.py       ← Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py          ← POST /auth/login, GET /auth/me
│   │   ├── users.py         ← CRUD for user management (admin only)
│   │   ├── players.py       ← CRUD for players (area-scoped)
│   │   ├── competitions.py  ← CRUD for competitions
│   │   └── registrations.py ← Register players in competitions
│   ├── core/
│   │   ├── security.py      ← bcrypt + JWT
│   │   └── dependencies.py  ← get_current_user, require_admin
│   └── utils/
│       └── file_upload.py   ← Image validation + disk save
├── uploads/                 ← Player photos and Aadhar scans (gitignored)
├── database_setup.sql       ← Complete SQL (run once in pgAdmin)
├── generate_hashes.py       ← Generate bcrypt hashes for SQL
├── frontend_api_integration.ts ← Drop into React src/api/api.ts
├── requirements.txt
├── .env.example
└── run.py
```

---

## Key Business Rules Enforced by the Backend

| Rule | Where Enforced |
|------|---------------|
| Only `@gatka.com` emails allowed | Pydantic validator in `LoginRequest` |
| User can only add players to their own area | `players.py` — checks `player.area_id == current_user.area_id` |
| User can only see their own area's players | `players.py` — filters query by `area_id` |
| User can only register their area's players | `registrations.py` — area check before insert |
| Admin sees everything | All routers check `current_user.role == 'admin'` and skip filters |
| Competition must be open to register | `registrations.py` — checks `status in ('upcoming','active')` |
| No duplicate registrations | DB `UNIQUE (competition_id, player_id)` constraint |
| Aadhar number unique per player | DB `UNIQUE` constraint on `aadhar_no` |
| Passwords stored as bcrypt hashes | `security.py` — `hash_password()` called on every create/update |

---

## Changing a User's Password (via pgAdmin)

1. Run `generate_hashes.py` and copy the new hash
2. Open pgAdmin → Query Tool
3. Run:
```sql
UPDATE users
SET password_hash = '<paste_new_hash_here>'
WHERE email = 'xxx@gatka.com';
```

---

## Production Checklist

- [ ] Run `generate_hashes.py` and update SQL with fresh hashes
- [ ] Set a strong `SECRET_KEY` in `.env`
- [ ] Change all default passwords and inform users
- [ ] Add your production domain to `allow_origins` in `main.py`
- [ ] Set up nginx as a reverse proxy with HTTPS/SSL
- [ ] Move `uploads/` to a persistent volume outside the app folder
- [ ] Set up PostgreSQL daily backups
- [ ] Use `--workers 4` in uvicorn for production load
