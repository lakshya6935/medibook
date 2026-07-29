# MediBook (React + Node/Express + MongoDB)

The UI is unchanged from the original supplied project. Auth (register/login),
role-based accounts (patient / doctor / admin), and the Doctors / Booking /
Dashboard pages are now backed by a real API and MongoDB instead of
localStorage demo data.

## Project structure
```
medibook-react-final/
  src/                 React frontend (Vite)
  server/              Node/Express + MongoDB backend
```

## 1. Backend setup
```
cd server
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm run dev                # starts API on http://localhost:5000
```
Requires a running MongoDB instance (local `mongod`, Docker, or MongoDB Atlas)
matching `MONGO_URI` in `.env`.

Optional: seed 3 demo accounts (admin / doctor / patient):
```
npm run seed
```
This creates:
- admin@medibook.com / admin123
- doctor@medibook.com / doctor123
- patient@medibook.com / patient123

## 2. Frontend setup
```
cp .env.example .env       # sets VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts frontend on http://localhost:5173
```

## What was added
- **Backend** (`/server`): Express API, Mongoose models (`User`, `Appointment`),
  bcrypt password hashing, JWT-based auth, and role checks (patient / doctor / admin).
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `GET /api/doctors`
  - `POST /api/appointments`, `GET /api/appointments/mine`, `GET /api/appointments/all` (admin), `PATCH /api/appointments/:id/status`
  - `GET /api/admin/stats`
- **Frontend**: `src/api.js` is a small fetch wrapper that talks to the backend
  and stores the JWT + user in `localStorage` under the key `medibookAuth`.
  - `Login.jsx` / `Register.jsx` now call the real API instead of writing
    directly to localStorage.
  - `Doctors` page lists real registered doctors.
  - `Booking` page is a real appointment form (date, time, reason) that saves
    to the database.
  - `Dashboard` pages show real appointment data and counts per role; doctors
    and admins can confirm/complete/cancel appointments.
  - `Header.jsx` now shows "Logout" instead of "Login" once a user is signed
    in (same link styling -- the only non-cosmetic addition needed to make
    multi-user auth usable).

No other markup, CSS, or visual styling was changed.

## Notes / next steps
- This is a functional demo-grade implementation, not hardened for
  production (e.g., no rate limiting, refresh tokens, or email verification).
- Doctor `specialty` defaults to "General Physician" since the registration
  form (kept unchanged) doesn't collect it; it can be set directly in MongoDB
  or a future admin edit screen.
