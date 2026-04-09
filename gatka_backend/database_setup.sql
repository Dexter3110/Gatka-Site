-- =============================================================
--  Maharashtra Gatka Federation — Complete Database Setup
--  Run this entire file in pgAdmin Query Tool
--  Connect to: gatka_federation database
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- SECTION 1: Areas (36 Districts + 29 Municipal Corporations)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS areas (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    area_type   VARCHAR(20)  NOT NULL CHECK (area_type IN ('district', 'mnc')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 36 Districts
INSERT INTO areas (name, area_type) VALUES
('Ahmednagar',          'district'),
('Akola',               'district'),
('Amravati',            'district'),
('Aurangabad',          'district'),
('Beed',                'district'),
('Bhandara',            'district'),
('Buldhana',            'district'),
('Chandrapur',          'district'),
('Dhule',               'district'),
('Gadchiroli',          'district'),
('Gondia',              'district'),
('Hingoli',             'district'),
('Jalgaon',             'district'),
('Jalna',               'district'),
('Kolhapur',            'district'),
('Latur',               'district'),
('Mumbai City',         'district'),
('Mumbai Suburban',     'district'),
('Nagpur',              'district'),
('Nanded',              'district'),
('Nandurbar',           'district'),
('Nashik',              'district'),
('Osmanabad',           'district'),
('Palghar',             'district'),
('Parbhani',            'district'),
('Pune',                'district'),
('Raigad',              'district'),
('Ratnagiri',           'district'),
('Sangli',              'district'),
('Satara',              'district'),
('Sindhudurg',          'district'),
('Solapur',             'district'),
('Thane',               'district'),
('Wardha',              'district'),
('Washim',              'district'),
('Yavatmal',            'district')
ON CONFLICT (name) DO NOTHING;

-- 29 Municipal Corporations
INSERT INTO areas (name, area_type) VALUES
('Brihanmumbai (BMC)',                          'mnc'),
('Pune Municipal Corporation',                  'mnc'),
('Nagpur Municipal Corporation',                'mnc'),
('Thane Municipal Corporation',                 'mnc'),
('Nashik Municipal Corporation',                'mnc'),
('Aurangabad Municipal Corporation',            'mnc'),
('Solapur Municipal Corporation',               'mnc'),
('Amravati Municipal Corporation',              'mnc'),
('Nanded-Waghala Municipal Corporation',        'mnc'),
('Kolhapur Municipal Corporation',              'mnc'),
('Sangli-Miraj-Kupwad Municipal Corporation',   'mnc'),
('Malegaon Municipal Corporation',              'mnc'),
('Jalgaon Municipal Corporation',               'mnc'),
('Akola Municipal Corporation',                 'mnc'),
('Latur Municipal Corporation',                 'mnc'),
('Chandrapur Municipal Corporation',            'mnc'),
('Dhule Municipal Corporation',                 'mnc'),
('Ichalkaranji Municipal Corporation',          'mnc'),
('Pimpri-Chinchwad Municipal Corporation',      'mnc'),
('Navi Mumbai Municipal Corporation',           'mnc'),
('Vasai-Virar City Municipal Corporation',      'mnc'),
('Kalyan-Dombivli Municipal Corporation',       'mnc'),
('Ulhasnagar Municipal Corporation',            'mnc'),
('Bhiwandi-Nizampur Municipal Corporation',     'mnc'),
('Mira-Bhayandar Municipal Corporation',        'mnc'),
('Panvel Municipal Corporation',                'mnc'),
('Mhow Municipal Corporation',                  'mnc'),
('Baramati Municipal Corporation',              'mnc'),
('Shirdi Municipal Corporation',                'mnc')
ON CONFLICT (name) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- SECTION 2: Users Table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    role          VARCHAR(10)  NOT NULL DEFAULT 'user'
                      CHECK (role IN ('admin', 'user')),
    area_id       INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_area_id ON users(area_id);


-- ─────────────────────────────────────────────────────────────
-- SECTION 3: Admin User
-- Password = Admin@Gatka2024
-- IMPORTANT: Run generate_hashes.py first to get a fresh hash,
--            then replace the hash below before running this SQL.
-- ─────────────────────────────────────────────────────────────

INSERT INTO users (email, password_hash, full_name, role, area_id)
VALUES (
    'admin@gatka.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCangelwbbUBdj8XBPL8a',
    'Administrator',
    'admin',
    NULL
)
ON CONFLICT (email) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- SECTION 4: Auto-generate 65 user accounts (one per area)
-- Default password = Gatka@2024
-- Hash below is for 'Gatka@2024' — regenerate via generate_hashes.py
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
    pw_hash    TEXT := '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36RRRHbRlpCFRPOo5ywXb8i';
    rec        RECORD;
    slug       TEXT;
    user_email TEXT;
    user_name  TEXT;
BEGIN
    FOR rec IN SELECT id, name, area_type FROM areas ORDER BY id LOOP
        -- Build a clean email slug from the area name
        slug := lower(regexp_replace(rec.name, '[^a-zA-Z0-9]', '', 'g'));
        slug := substring(slug, 1, 25);  -- cap at 25 chars

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


-- ─────────────────────────────────────────────────────────────
-- SECTION 5: Verify — shows all 66 accounts (1 admin + 65 users)
-- ─────────────────────────────────────────────────────────────

SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    a.name       AS area,
    a.area_type,
    u.is_active
FROM users u
LEFT JOIN areas a ON u.area_id = a.id
ORDER BY u.role DESC, a.area_type NULLS FIRST, a.name;


-- ─────────────────────────────────────────────────────────────
-- SECTION 6: Players Table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS players (
    id               SERIAL PRIMARY KEY,
    area_id          INTEGER NOT NULL REFERENCES areas(id)  ON DELETE RESTRICT,
    added_by_user_id INTEGER NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,

    -- Personal
    full_name        VARCHAR(150) NOT NULL,
    father_name      VARCHAR(150),
    mother_name      VARCHAR(150),
    date_of_birth    DATE NOT NULL,
    gender           VARCHAR(10)  NOT NULL
                         CHECK (gender IN ('male','female','other')),
    marital_status   VARCHAR(20)
                         CHECK (marital_status IN ('single','married','divorced','widowed')),

    -- Contact
    email            VARCHAR(150),
    phone_no         VARCHAR(15),
    whatsapp_no      VARCHAR(15),

    -- Identity
    aadhar_no        VARCHAR(12) UNIQUE,
    t_shirt_size     VARCHAR(5)
                         CHECK (t_shirt_size IN ('XS','S','M','L','XL','XXL','3XL')),

    -- Address
    state            VARCHAR(100) DEFAULT 'Maharashtra',
    address          TEXT,

    -- Uploaded document paths (relative to UPLOAD_DIR)
    passport_photo_path VARCHAR(255),
    aadhar_front_path   VARCHAR(255),
    aadhar_back_path    VARCHAR(255),

    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_area_id ON players(area_id);
CREATE INDEX IF NOT EXISTS idx_players_dob     ON players(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_players_gender  ON players(gender);
CREATE INDEX IF NOT EXISTS idx_players_name    ON players(full_name);


-- ─────────────────────────────────────────────────────────────
-- SECTION 7: Competitions Table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitions (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(255) NOT NULL,
    venue                 VARCHAR(255),
    start_date            DATE NOT NULL,
    end_date              DATE,
    registration_deadline DATE,
    max_participants      INTEGER,
    status                VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                              CHECK (status IN ('upcoming','active','completed','cancelled')),
    description           TEXT,
    created_by_admin_id   INTEGER NOT NULL REFERENCES users(id),
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_dates  ON competitions(start_date);


-- ─────────────────────────────────────────────────────────────
-- SECTION 8: Competition Age Categories
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competition_age_categories (
    id             SERIAL PRIMARY KEY,
    competition_id INTEGER NOT NULL
                       REFERENCES competitions(id) ON DELETE CASCADE,
    category_name  VARCHAR(100) NOT NULL,
    min_age        INTEGER,
    max_age        INTEGER
);

CREATE INDEX IF NOT EXISTS idx_cat_competition ON competition_age_categories(competition_id);


-- ─────────────────────────────────────────────────────────────
-- SECTION 9: Competition Registrations (Participants)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competition_registrations (
    id                SERIAL PRIMARY KEY,
    competition_id    INTEGER NOT NULL REFERENCES competitions(id)  ON DELETE CASCADE,
    player_id         INTEGER NOT NULL REFERENCES players(id)       ON DELETE CASCADE,
    area_id           INTEGER NOT NULL REFERENCES areas(id),
    registered_by     INTEGER NOT NULL REFERENCES users(id),
    age_category      VARCHAR(100),
    event_group       VARCHAR(100),
    event_name        VARCHAR(100),
    registration_date TIMESTAMP DEFAULT NOW(),
    status            VARCHAR(20) DEFAULT 'registered'
                          CHECK (status IN ('registered','confirmed','withdrawn')),
    CONSTRAINT uq_comp_player UNIQUE (competition_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_reg_competition ON competition_registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_reg_player      ON competition_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_reg_area        ON competition_registrations(area_id);


-- ─────────────────────────────────────────────────────────────
-- SECTION 10: Auto-update updated_at on row changes
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at        ON users;
DROP TRIGGER IF EXISTS trg_players_updated_at      ON players;
DROP TRIGGER IF EXISTS trg_competitions_updated_at ON competitions;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─────────────────────────────────────────────────────────────
-- SECTION 11: Grant permissions to app user
-- ─────────────────────────────────────────────────────────────

GRANT USAGE  ON SCHEMA public TO gatka_app;
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO gatka_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gatka_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO gatka_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO gatka_app;


-- ─────────────────────────────────────────────────────────────
-- SECTION 12: Useful admin queries (for reference)
-- ─────────────────────────────────────────────────────────────

-- Count users by type:
-- SELECT role, COUNT(*) FROM users GROUP BY role;

-- List all users with their area:
-- SELECT u.email, u.full_name, a.name, a.area_type
-- FROM users u LEFT JOIN areas a ON u.area_id = a.id ORDER BY a.area_type, a.name;

-- Reset a specific user's password (replace hash and email):
-- UPDATE users SET password_hash = '<new_bcrypt_hash>' WHERE email = 'xxx@gatka.com';

-- Deactivate a user:
-- UPDATE users SET is_active = FALSE WHERE email = 'xxx@gatka.com';

-- Count players per area:
-- SELECT a.name, a.area_type, COUNT(p.id) AS player_count
-- FROM areas a LEFT JOIN players p ON p.area_id = a.id
-- GROUP BY a.name, a.area_type ORDER BY player_count DESC;

-- Competition registration summary:
-- SELECT c.name, a.name AS area, COUNT(r.id) AS registrations
-- FROM competition_registrations r
-- JOIN competitions c ON c.id = r.competition_id
-- JOIN areas a ON a.id = r.area_id
-- GROUP BY c.name, a.name ORDER BY c.name, registrations DESC;

-- =============================================================
-- END OF SETUP SCRIPT
-- =============================================================
