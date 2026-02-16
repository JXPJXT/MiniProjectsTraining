-- =============================================================================
--          COLLEGE PLACEMENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =============================================================================
-- Execution order: ENUMs → Tables → (constraints/indexes can be added later)
-- Created: consolidated single-file version
-- =============================================================================

-- 1. ENUM TYPES (must come first)
CREATE TYPE user_role AS ENUM (
    'student',
    'faculty',
    'tpc',
    'admin',
    'super_admin'
);

CREATE TYPE placement_status AS ENUM (
    'active',
    'inactive',
    'debarred',
    'exit'
);

CREATE TYPE drive_status AS ENUM (
    'open',
    'closed',
    'cancelled'
);

CREATE TYPE offer_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);

CREATE TYPE verification_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

-- =============================================================================
-- 2. CORE USERS (Supabase auth users are referenced here)
-- =============================================================================

CREATE TABLE users (
    id          UUID PRIMARY KEY,
    role        user_role NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. STUDENTS
-- =============================================================================

CREATE TABLE students (
    student_id      BIGINT PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    reg_no          VARCHAR(20) UNIQUE,
    full_name       TEXT NOT NULL,
    program         TEXT,
    stream          TEXT,
    batch_start_year INTEGER,
    batch_end_year  INTEGER,
    cgpa            NUMERIC(3,2),
    backlog_count   INTEGER DEFAULT 0,
    status          placement_status DEFAULT 'active',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. PLACEMENT PROFILE (one per student usually)
-- =============================================================================

CREATE TABLE placement_profiles (
    placement_id     BIGSERIAL PRIMARY KEY,
    student_id       BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    policy_accepted  BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP WITH TIME ZONE,
    opportunity_start DATE,
    placement_status placement_status DEFAULT 'inactive',
    pep_fee_paid     NUMERIC DEFAULT 0,
    pep_fee_status   TEXT,
    last_updated     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id)
);

-- =============================================================================
-- 5. CONTACT & FAMILY
-- =============================================================================

CREATE TABLE student_contacts (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    email       TEXT,
    mobile      VARCHAR(15),
    whatsapp    VARCHAR(15),
    linkedin_url TEXT,
    microsoft_id TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE student_family (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    relation     TEXT,
    name         TEXT,
    age          INTEGER,
    designation  TEXT,
    employer     TEXT,
    contact_no   VARCHAR(15),
    email        TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. PLACEMENT DRIVES
-- =============================================================================

CREATE TABLE placement_drives (
    drive_id            BIGSERIAL PRIMARY KEY,
    drive_code          VARCHAR(50) UNIQUE NOT NULL,
    company_name        TEXT NOT NULL,
    drive_type          TEXT,
    drive_date          DATE,
    venue               TEXT,
    streams_eligible    TEXT,               -- can be comma separated or JSON later
    registration_deadline TIMESTAMP WITH TIME ZONE,
    status              drive_status DEFAULT 'open',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 7. DRIVE ROUNDS (technical / HR / coding / aptitude / etc.)
-- =============================================================================

CREATE TABLE drive_rounds (
    round_id     BIGSERIAL PRIMARY KEY,
    drive_id     BIGINT NOT NULL REFERENCES placement_drives(drive_id) ON DELETE CASCADE,
    round_name   TEXT NOT NULL,
    round_order  INTEGER NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (drive_id, round_order)
);

-- =============================================================================
-- 8. CORE RELATIONSHIP: Student ↔ Drive
-- =============================================================================

CREATE TABLE student_drive_map (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    drive_id        BIGINT NOT NULL REFERENCES placement_drives(drive_id) ON DELETE CASCADE,
    is_eligible     BOOLEAN,
    registered      BOOLEAN DEFAULT FALSE,
    participated    BOOLEAN DEFAULT FALSE,
    selected        BOOLEAN DEFAULT FALSE,
    offer_status    offer_status DEFAULT 'pending',
    drive_status    TEXT,                   -- free text stage if needed
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id, drive_id)
);

-- =============================================================================
-- 9. ATTENDANCE + DUTY LEAVE
-- =============================================================================

CREATE TABLE drive_attendance (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    drive_id    BIGINT NOT NULL REFERENCES placement_drives(drive_id) ON DELETE CASCADE,
    round_id    BIGINT REFERENCES drive_rounds(round_id) ON DELETE SET NULL,
    attended    BOOLEAN NOT NULL,
    marked_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marked_by   UUID REFERENCES users(id),
    UNIQUE (student_id, drive_id, round_id)
);

CREATE TABLE duty_leave_requests (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    drive_id    BIGINT REFERENCES placement_drives(drive_id) ON DELETE SET NULL,
    date        DATE NOT NULL,
    start_time  TIME,
    end_time    TIME,
    remarks     TEXT,
    proof_path  TEXT,
    status      verification_status DEFAULT 'pending',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id)
);

-- =============================================================================
-- 10. DOCUMENTS & VERIFICATION
-- =============================================================================

CREATE TABLE student_documents (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    document_type   TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    uploaded_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by     UUID REFERENCES users(id)
);

CREATE TABLE document_verifications (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         BIGINT NOT NULL REFERENCES student_documents(id) ON DELETE CASCADE,
    soft_skill_status   verification_status DEFAULT 'pending',
    technical_status    verification_status DEFAULT 'pending',
    remarks             TEXT,
    verified_by         UUID REFERENCES users(id),
    verified_at         TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 11. SKILLS & PREFERENCES
-- =============================================================================

CREATE TABLE student_preferences (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    job_locations   TEXT[],
    employment_types TEXT[],
    job_profiles    TEXT[],
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (student_id)
);

CREATE TABLE student_skills (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    skill_name      TEXT NOT NULL,
    skill_level     TEXT,
    experience_years NUMERIC(4,1),
    certification   TEXT,
    projects        TEXT,
    status          verification_status DEFAULT 'pending',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 12. OFF-CAMPUS / INDEPENDENT OFFERS
-- =============================================================================

CREATE TABLE independent_offers (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    company_name        TEXT NOT NULL,
    stipend             NUMERIC,
    ctc                 NUMERIC,
    duration            TEXT,
    offer_letter_path   TEXT,
    bank_statement_path TEXT,
    status              verification_status DEFAULT 'pending',
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by         UUID REFERENCES users(id)
);

-- =============================================================================
-- 13. COMMUNICATION
-- =============================================================================

CREATE TABLE messages (
    id          BIGSERIAL PRIMARY KEY,
    sender_id   UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at     TIMESTAMP WITH TIME ZONE
);

CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    payload     JSONB,
    read        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 14. AUDIT LOGGING
-- =============================================================================

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    entity      TEXT,
    entity_id   TEXT,
    old_data    JSONB,
    new_data    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Quick helpful indexes (optional but strongly recommended)
-- =============================================================================

CREATE INDEX idx_students_user_id        ON students(user_id);
CREATE INDEX idx_students_reg_no         ON students(reg_no);
CREATE INDEX idx_placement_profile_std   ON placement_profiles(student_id);
CREATE INDEX idx_student_drive_map_std   ON student_drive_map(student_id);
CREATE INDEX idx_student_drive_map_drive ON student_drive_map(drive_id);
CREATE INDEX idx_notifications_user      ON notifications(user_id);
CREATE INDEX idx_messages_sender         ON messages(sender_id);
CREATE INDEX idx_messages_receiver       ON messages(receiver_id);

-- End of schema