# SkillSwap

A skill-exchange platform where users offer skills they know and request skills
they want to learn. Built with **Next.js** (frontend) and **Express.js + MongoDB**
(backend), all in JavaScript.

## Structure

```
SkillSwap/
├── backend/   # Express.js API + Mongoose models
└── frontend/  # Next.js (App Router) client
```

## Prerequisites

- Node.js 18+
- MongoDB (local `mongod` on `mongodb://127.0.0.1:27017` or MongoDB Atlas)
- npm

## Setup

### 1. Backend
```bash
cd backend
npm install
# edit .env if needed (MONGODB_URI, JWT_SECRET, PORT)
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:3000
```

Open http://localhost:3000 and sign up.

## Features

- User registration / login (JWT auth)
- Profile with skills offered & wanted, bio, location, availability
- Explore other users (search by name / skill / location)
- Public profile view + send skill-swap requests
- Dashboard: accept / decline / complete / cancel swap requests

## API summary

| Method | Endpoint                | Description                       |
|--------|-------------------------|-----------------------------------|
| POST   | /api/auth/register      | Create account                    |
| POST   | /api/auth/login         | Login (returns JWT)               |
| GET    | /api/auth/me           | Current user                      |
| GET    | /api/users/explore      | List other users (optional `q`)   |
| GET    | /api/users/:id          | Public profile                    |
| PUT    | /api/users/me           | Update own profile                |
| POST   | /api/swaps              | Create swap request               |
| GET    | /api/swaps?role=        | sent / received / all             |
| PATCH  | /api/swaps/:id          | Update status (accept/complete)   |
| DELETE | /api/swaps/:id          | Cancel request                    |
