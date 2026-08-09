# WorkTrack Backend API

Express.js + PostgreSQL backend powering **WorkTrack**, the staff attendance
management system for the **Ikorodu Local Government Secretariat**.

The API handles authentication, staff self-registration, check-in/check-out,
admin oversight, and report/export endpoints.

## Stack

- **Node.js 18+** · **Express.js**
- **PostgreSQL** (via `pg`/`node-postgres`)
- **JWT** auth (`jsonwebtoken` + `bcryptjs`)
- **PDFKit** & `json2csv` for report exports

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted instance / connection string)

## Quick setup

```bash
npm install
cp .env.example .env
```

Create the database, then initialize & seed it:

```bash
createdb worktrack        # or create it via your Postgres client
npm run db:init           # apply src/db/schema.sql (tables + default departments)
npm run db:seed           # create admin + 5 demo staff accounts
npm run dev               # nodemon → http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`.

> **Tip:** staff can also create their own accounts through `POST /api/auth/register`
> (active immediately), so seeding is only needed for the admin account and
> demo data.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | Runtime mode (`production` toggles morgan logging) |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `DATABASE_URL` | — | Postgres connection string (overrides `PG*` vars) |
| `PGHOST` / `PGPORT` | `localhost` / `5432` | Postgres host / port |
| `PGDATABASE` | `worktrack` | Postgres database name |
| `PGUSER` | `postgres` | Postgres user |
| `PGPASSWORD` | `postgres` | Postgres password |
| `JWT_SECRET` | `dev_secret_change_me` | JWT signing secret — **set a strong value in production** |
| `JWT_EXPIRES_IN` | `8h` | JWT lifetime |
| `OFFICE_LATITUDE` / `OFFICE_LONGITUDE` | `6.6152` / `3.5073` | Secretariat coordinates (stored on check-in records) |
| `OFFICE_RADIUS_METERS` | `200` | Geofence radius |
| `WORK_START_TIME` | `08:00` | On-time cutoff |
| `LATE_CUTOFF_TIME` | `09:00` | Late/half-day cutoff |
| `WORK_END_TIME` | `16:00` | Standard exit time |
| `FULL_WORK_HOURS` | `8` | Full productive-day hours |

```text
Default: postgres:postgres@localhost:5432/worktrack
```

> **Note on location:** check-in does **not** enforce the geofence. Coordinates
> are stored if the client sends them, but check-in is never rejected based on
> location. The `OFFICE_*` values remain as defaults for reference.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run with nodemon (auto-restart on change) |
| `npm start` | Run in production |
| `npm run db:init` | Apply the schema |
| `npm run db:seed` | Seed admin + demo staff |

## API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Sign in (staff/admin) |
| POST | `/api/auth/register` | — | Staff self-registration (staff ID, dept, position) |
| GET | `/api/auth/departments` | — | Public department list |
| GET | `/api/auth/me` | ✅ | Current user profile |
| POST | `/api/auth/change-password` | ✅ | Change own password |
| GET | `/api/attendance/today` | ✅ | Today's record for current user |
| POST | `/api/attendance/check-in` | ✅ | Check in (no location required) |
| POST | `/api/attendance/check-out` | ✅ | Check out |
| GET | `/api/attendance/history` | ✅ | Monthly history + summary |
| GET | `/api/staff/departments` | ✅ admin | Departments + staff counts |
| GET | `/api/staff` | ✅ admin | List/search staff |
| POST | `/api/staff` | ✅ admin | Create staff |
| PUT | `/api/staff/:id` | ✅ admin | Edit staff |
| PATCH | `/api/staff/:id/deactivate` | ✅ admin | Toggle active/inactive |
| DELETE | `/api/staff/:id` | ✅ admin | Permanently delete staff |
| GET | `/api/admin/dashboard` | ✅ admin | Headline stats + trends |
| GET | `/api/admin/attendance-board` | ✅ admin | Live daily register |
| POST | `/api/admin/override` | ✅ admin | Manual attendance override |
| GET | `/api/reports/department-analytics` | ✅ admin | Department productivity |
| GET | `/api/reports/staff-ranking` | ✅ admin | Productivity leaderboard |
| GET | `/api/reports/export/csv` | ✅ admin | Monthly CSV export |
| GET | `/api/reports/export/pdf` | ✅ admin | Monthly PDF export |

## Business rules

- **Check-in:** ≤ 8:00 AM → `on_time` · 8:01–9:00 AM → `late` · after 9:00 AM → `half_day`
- **Check-out:** before 4:00 PM → `early_exit` · ≥ 4:00 PM → `standard_exit`
- **Productivity:** `productive` (on time + standard exit) · `partial`
  (late/early) · `non_productive` (single stamp) · `absent` (no record)

All time thresholds are configurable via `.env`.

## Project structure

```
src/
├── app.js            Express app + middleware + route mounting
├── server.js         Entry point
├── config/           db pool + environment constants
├── controllers/      Route logic (auth, attendance, staff, admin, reports)
├── middleware/       auth (JWT + admin) + error handling
├── db/               schema.sql, init.js, seed.js
├── routes/           Express routers
└── utils/            JWT, attendance classification, geolocation helpers
```

## Deployment notes

- Any Node host (Render, Railway, Fly.io, a VPS).
- Point `DATABASE_URL` at a managed Postgres instance (Supabase, Neon, RDS…).
- Set a strong `JWT_SECRET` and change all seeded passwords (see `.env.example`).
- Run `npm run db:init` once against the production database before `npm start`.