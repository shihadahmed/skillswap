# SkillSwap

A freelance micro-task marketplace (Fiverr / TaskHive style) where clients post small
tasks, freelancers apply with proposals, and work is delivered and rated. Built with
Next.js 14 (frontend) and Express + Mongoose (backend), deployed on Vercel.

## Features (so far)
- Email + Google (dummy) authentication with JWT stored in an HTTPOnly cookie.
- Role-based accounts: client, freelancer, admin.
- Tasks API: create, browse (search + category filter + pagination), update, delete.
- Proposals: freelancers apply; clients accept one (auto-rejects the rest, marks the
  task `in_progress`).
- Role-guarded dashboards for client / freelancer / admin.

## Tech stack
- **Frontend:** Next.js 14 (App Router, JS), Tailwind CSS, Plus Jakarta Sans.
- **Backend:** Express.js, Mongoose (MongoDB Atlas), custom JWT cookie auth.
- **Styling:** Electric Indigo & Violet theme.

## Getting started

You need Node 18+ and a MongoDB Atlas connection string.

```bash
# Backend (terminal 1)
cd backend
cp .env.example .env        # then fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev                 # http://localhost:5000

# Frontend (terminal 2)
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # http://localhost:3000
```

## Project layout
- `backend/src` — Express app, models, routes (`auth`, `users`, `swaps`, `tasks`,
  `proposals`), `middleware/auth.js`, `config/db.js`, Vercel handler `api/index.js`.
- `frontend/src` — Next.js app (`app/`, `components/`, `context/AuthContext.js`,
  `lib/api.js`).

See `AGENTS.md` for the full architecture, API reference, and implementation roadmap.

## Deployment
Two Vercel projects from this repo:
- Frontend → root `frontend`
- Backend → root `backend` (with `vercel.json`)

Set the environment variables from the `.env.example` files in each Vercel project.
