# WorkTrack — Staff Attendance Management System

## What is WorkTrack?

**WorkTrack** is a staff attendance management system that records daily
check-ins and check-outs for **Ikorodu Local Government Secretariat** staff.

Every work day, staff sign in to record a check-in and check-out stamp. The
system automatically scores each day against the standard government
8:00 AM–4:00 PM work window — marking arrivals as **on time**, **late**, or
**half-day**, and flagging early exits. Admins see a live daily register,
department-level analytics, and can review or correct records with a single
click.

Instead of being provisioned centrally by HR, staff **create their own accounts**
on a public registration page — choosing their department and position held.
Administrators review these accounts and can **deactivate, reactivate, or
permanently delete** any staff member at any time. Unlike a traditional geofenced
attendance app, WorkTrack places no location restriction on check-in, so records
can be stamped from anywhere.

> **In short:** WorkTrack is a self-service, admin-supervised attendance register
> for local government staff — accurate time-keeping, transparent oversight, and
> zero hardware.

---

## 1. Feature overview

- **Public landing page** (`/`) — introduces WorkTrack and links to sign in/register.
- **Self-registration** (`/register`) — staff create their own account with a staff
  ID, full name, email, department and position held. Accounts are active immediately.
- **Admin verification** — admins review all staff accounts and can
  deactivate, reactivate, or permanently delete any staff member.
- **Check-in / check-out** — no location or geofence requirement, works from anywhere.
- **Government work-hour rules** — automatic on-time / late / half-day /
  early-exit / standard-exit classification (configurable).
- **Daily productivity scoring** — Productive, Partial, Non-Productive, Absent.
- **Admin analytics** — live register, headline stats, department breakdowns,
   PDF/CSV export.

## 2. Project structure

```
worktrack/
├── worktrack_backend/    Express API + PostgreSQL
└── worktrack_frontend/   Vite + React + Tailwind frontend
```

## 3. Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)

## 4. Backend setup

```bash
cd worktrack_backend
npm install
cp .env.example .env
```

Edit `.env`:
- Set `DATABASE_URL` (or the individual `PG*` vars) to point at your Postgres instance.
- Set a strong `JWT_SECRET`.

Create the database, then run:

```bash
createdb worktrack          # or create it via your Postgres client
npm run db:init             # creates all tables (src/db/schema.sql)
npm run db:seed             # creates an admin account + 5 demo staff
npm run dev                 # starts the API on http://localhost:5000
```

**Seeded demo accounts** (change these passwords in production):

| Role  | Email                              | Password  |
|-------|-------------------------------------|-----------|
| Admin | admin@ikorodulg.gov.ng              | Admin@123 |
| Staff | adeola.bello@ikorodulg.gov.ng       | Staff@123 |
| Staff | chidi.okafor@ikorodulg.gov.ng       | Staff@123 |
| Staff | fatima.suleiman@ikorodulg.gov.ng    | Staff@123 |
| Staff | tunde.adewale@ikorodulg.gov.ng      | Staff@123 |
| Staff | ngozi.eze@ikorodulg.gov.ng          | Staff@123 |

## 5. Frontend setup

```bash
cd worktrack_frontend
npm install
cp .env.example .env       # VITE_API_URL defaults to http://localhost:5000/api
npm run dev                 # starts on http://localhost:5173
```

Open `http://localhost:5173` to land on the landing page. From there you can
**create a staff account** or **sign in**.

> **No location requirements:** check-in needs no browser location/geolocation
> permission, so the app works over plain `http://` and on any device.

## 6. Business logic implemented

**Check-in window**
- ≤ 8:00 AM → On Time
- 8:01–9:00 AM → Late
- After 9:00 AM → Half-Day / Flagged

**Check-out window**
- Before 4:00 PM → Early Exit
- ≥ 4:00 PM → Standard Exit

**Daily productivity**
- `Productive` — checked in ≤ 8:00 AM **and** checked out ≥ 4:00 PM
- `Partial` — late check-in or early check-out
- `Non-Productive` — checked in but never checked out (or vice versa)
- `Absent` — no attendance record for the day

All thresholds (times) are configurable via `worktrack_backend/.env` — no code
changes needed to adjust them.

## 7. Accounts & admin control

- **Self-registered staff** are active as soon as they complete the register form.
- **Admins** (via `/admin/staff`) can:
  - browse and search all staff accounts,
  - **deactivate / reactivate** an account (prevents sign-in),
  - **permanently delete** a staff member and their attendance records.

## 8. Key API endpoints

| Method | Endpoint                              | Description                          |
|--------|----------------------------------------|---------------------------------------|
| POST   | `/api/auth/login`                      | Staff/admin login                     |
| POST   | `/api/auth/register`                   | Staff self-service registration        |
| GET    | `/api/auth/departments`                | Public department list                 |
| GET    | `/api/auth/me`                         | Current user profile                  |
| GET    | `/api/attendance/today`                | Today's attendance record             |
| POST   | `/api/attendance/check-in`             | Check in (no location required)       |
| POST   | `/api/attendance/check-out`            | Check out                             |
| GET    | `/api/attendance/history`              | Monthly attendance history            |
| GET    | `/api/staff/departments`               | (admin) Departments + staff counts    |
| GET    | `/api/staff`                           | (admin) List/search staff             |
| POST   | `/api/staff`                           | (admin) Create staff                  |
| PUT    | `/api/staff/:id`                       | (admin) Edit staff                    |
| PATCH  | `/api/staff/:id/deactivate`            | (admin) Activate/deactivate           |
| DELETE | `/api/staff/:id`                       | (admin) Permanently delete            |
| GET    | `/api/admin/dashboard`                 | (admin) Headline stats + trends       |
| GET    | `/api/admin/attendance-board`          | (admin) Live daily register           |
| POST   | `/api/admin/override`                  | (admin) Manual attendance override    |
| GET    | `/api/reports/department-analytics`    | (admin) Department productivity       |
| GET    | `/api/reports/staff-ranking`           | (admin) Productivity leaderboard      |
| GET    | `/api/reports/export/csv`              | (admin) Monthly CSV export            |
| GET    | `/api/reports/export/pdf`              | (admin) Monthly PDF export            |

## 9. Deployment notes

- Backend: any Node host (Render, Railway, Fly.io, a VPS). Point `DATABASE_URL` at a
  managed Postgres instance (e.g. Supabase, Neon, RDS).
- Frontend: `npm run build` in `worktrack_frontend/` produces a static `dist/` folder
  deployable to Vercel, Netlify, or any static host — just set `VITE_API_URL` to your
  deployed API.
- Change `JWT_SECRET` and all seeded passwords before going live.