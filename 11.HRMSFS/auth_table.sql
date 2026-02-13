-- =====================================================
-- HRMS Users Authentication Table
-- Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    user_id         SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),                    -- NULL for Google SSO users
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(50) DEFAULT 'employee',  -- employee, manager, hr, admin
    avatar_url      TEXT,
    auth_provider   VARCHAR(50) DEFAULT 'email',     -- 'email' or 'google'
    google_id       VARCHAR(255) UNIQUE,             -- Google sub ID for SSO users
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for Google SSO lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- =====================================================
-- Sessions Table (for token management)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    ip_address      VARCHAR(45),
    user_agent      TEXT
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);

-- Auto-cleanup expired sessions
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- =====================================================
-- Insert a default admin user (password: admin123)
-- The hash below is bcrypt for 'admin123'
-- You can change this after first login
-- =====================================================

-- NOTE: You'll need to insert the admin via the API's /auth/signup 
-- endpoint after deploying, since the bcrypt hash needs to be 
-- generated properly. Or run this after the backend is up:
--
-- curl -X POST http://localhost:8000/auth/signup \
--   -H "Content-Type: application/json" \
--   -d '{"email":"admin@hrms.com","password":"admin123","full_name":"System Admin","role":"admin"}'
