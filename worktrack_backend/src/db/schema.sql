-- ============================================================
-- WorkTrack Database Schema
-- Staff Attendance Management System
-- Ikorodu Local Government Secretariat
-- ============================================================

DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS (authentication for both staff & admin roles)
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STAFF (profile linked 1:1 to a user account)
-- ============================================================
CREATE TABLE staff (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    staff_id_number VARCHAR(30) UNIQUE NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    department_id   INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    position        VARCHAR(120),
    phone           VARCHAR(30),
    avatar_url      TEXT,
    date_joined     DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE RECORDS
-- One row per staff member per calendar day
-- ============================================================
CREATE TABLE attendance_records (
    id                  SERIAL PRIMARY KEY,
    staff_id            INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    work_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time       TIMESTAMPTZ,
    check_out_time      TIMESTAMPTZ,
    check_in_status     VARCHAR(20)  CHECK (check_in_status IN ('on_time', 'late', 'half_day')),
    check_out_status    VARCHAR(20)  CHECK (check_out_status IN ('early_exit', 'standard_exit')),
    productivity_status VARCHAR(25)  NOT NULL DEFAULT 'absent'
                         CHECK (productivity_status IN ('productive', 'partial', 'non_productive', 'absent')),
    hours_worked        NUMERIC(5,2) DEFAULT 0,
    check_in_lat        NUMERIC(10,7),
    check_in_lng        NUMERIC(10,7),
    check_in_distance_m NUMERIC(10,2),
    location_verified   BOOLEAN DEFAULT FALSE,
    is_override         BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason     TEXT,
    overridden_by        INTEGER REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (staff_id, work_date)
);

CREATE INDEX idx_attendance_staff_date ON attendance_records(staff_id, work_date);
CREATE INDEX idx_attendance_date ON attendance_records(work_date);
CREATE INDEX idx_staff_department ON staff(department_id);

-- ============================================================
-- Seed: Departments
-- ============================================================
INSERT INTO departments (name, description) VALUES
    ('Administration', 'General administrative services'),
    ('Finance & Accounts', 'Revenue, budgeting and accounts'),
    ('Health Services', 'Primary healthcare coordination'),
    ('Works & Environment', 'Infrastructure and sanitation'),
    ('Human Resources', 'Personnel management');

-- ============================================================
-- Seed: Admin user  (password: Admin@123 — hashed at seed-script time)
-- Seeding of users/staff with bcrypt hashes is handled by seed.js,
-- not here, since bcrypt hashing must happen in Node.
-- ============================================================
