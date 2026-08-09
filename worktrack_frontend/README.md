# WorkTrack Frontend

React + Vite single-page app for **WorkTrack**, the staff attendance management
system for the **Ikorodu Local Government Secretariat**.

Built with **Vite**, **React 19**, **Tailwind CSS (v4)**, and **react-router-dom**.
The UI uses a "Civic Ledger" design system (serif display font, ledger-green +
brass accents) defined in `src/index.css`.

## Stack

- Vite 8 · React 19 · Tailwind CSS v4
- react-router-dom (routing)
- axios (API client)
- lucide-react (icons) · recharts (charts) · date-fns

## Quick setup

Requirements: Node.js 18+ and the **WorkTrack backend** running on
`http://localhost:5000` (see `worktrack_backend/README.md`).

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the backend API |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on `http://localhost:5173` |
| `npm run build` | Build production output to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

## Pages & routes

| Route | Access | Page |
|---|---|---|
| `/` | Public | **Landing page** — intro + sign in / register CTAs (logged-in users are redirected to their dashboard) |
| `/register` | Public | **Register** — staff self-service signup (staff ID, department, position) |
| `/login` | Public | **Login** |
| `/dashboard` | Staff | **Staff dashboard** — check in / out, productivity stats, calendar |
| `/history` | Staff | **Attendance history** |
| `/admin` | Admin | **Admin dashboard** — headline stats + trends |
| `/admin/board` | Admin | **Live attendance board** |
| `/admin/staff` | Admin | **Staff management** — add/edit, deactivate/reactivate, delete |
| `/admin/reports` | Admin | **Reports & exports** (PDF/CSV) |

Logged-out users visiting `/` or any protected route are sent to the landing
page or `/login`. Admins vs staff routes are enforced by `ProtectedRoute`.

## Project structure

```
src/
├── main.jsx                 App entry point
├── App.jsx                  Routes + auth redirect
├── index.css                Tailwind + design tokens/keyframes
├── lib/api.js               Axios instance (base URL + auth header + 401 handling)
├── context/AuthContext.jsx  User state, login/logout, /auth/me bootstrap
├── layouts/DashboardLayout.jsx App shell (sidebar + mobile nav)
├── components/              ProtectedRoute, Topbar, Sidebar, StatCard, StatusBadge, DigitalClock
└── pages/                   Landing, Login, Register, StaffDashboard,
                             AttendanceHistory, AdminDashboard, AdminAttendanceBoard,
                             AdminStaffManagement, AdminReports
```

## Notes

- **No geolocation required:** the app never asks for browser location, so it
  works over plain `http://` on any device.
- **Self-registration:** anyone can create a staff account at `/register`;
  admins can deactivate, reactivate or permanently delete accounts in
  `/admin/staff`.

## Deployment

`npm run build` produces a static `dist/` folder deployable to **Vercel,
Netlify**, or any static host. Set `VITE_API_URL` (build-time) to your deployed
API, then serve `dist/`..