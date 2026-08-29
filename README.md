# SkillSwap

A freelance micro-task marketplace (Fiverr / TaskHive style) where clients post small
tasks, freelancers apply with proposals, and work is delivered, paid (dummy), and rated.
Built with Next.js 14 (frontend) and Express + Mongoose (backend), deployable to Vercel.

## Features
- Email + Google (dummy) authentication with a JWT stored in an HTTPOnly cookie.
- Role-based accounts: `client`, `freelancer`, `admin` (admin is seeded, not self-registered).
- Tasks: create, browse (search + category filter + pagination 9/page), update, delete.
- Proposals: freelancers apply; a client accepts one (auto-rejects the rest and moves the
  task to `in_progress`).
- Freelancers: dedicated collection with rich profiles, browse + detail, pagination.
- Dashboards:
  - **Client** — stats, post a task, manage proposals, dummy checkout, leave a review.
  - **Freelancer** — stats, browse tasks, track own proposals.
  - **Admin** — aggregate stats, manage users / tasks / transactions (delete actions).
- Dummy **Stripe checkout**: accept a proposal → one-click dummy pay → task `completed`.
- **Reviews / ratings**: client reviews the freelancer; average rating stored on the User.
- Custom 404 + global error boundary + loading state.
- Toast notifications (react-toastify) across key flows.

## Tech stack
- **Frontend:** Next.js 14 (App Router, JavaScript), Tailwind CSS, Plus Jakarta Sans, react-toastify.
- **Backend:** Express.js, Mongoose (MongoDB Atlas), custom JWT cookie auth.
- **Theme:** Electric Indigo & Violet (`brand #4F46E5`, `brand-hover #4338CA`, `accent #7C3AED`).

## Project layout
```
backend/src
  index.js            # local dev entry (kills stale port 5000, then listens)
  api/index.js        # Vercel serverless handler
  app.js              # express app: helmet, cors, cookieParser, json, mounts routes
  config/db.js        # cached mongoose connection (serverless-safe)
  middleware/auth.js   # JWT verify (header or cookie) -> req.user; requireRole; optionalAuth
  models/             # User, Task, Proposal, Payment, Review, Freelancer, SwapRequest
  routes/             # auth, users, swaps, tasks, proposals, freelancers, admin, payments, reviews
  scripts/seedAdmin.js
frontend/src
  app/                # layout, page, login, register, explore, profile, dashboard/[role],
                      #   tasks, tasks/[id], freelancers, freelancers/[id]
  components/         # Navbar, Footer, Logo, Hero, ProtectedRoute, TaskCard, TaskSearch,
                      #   FreelancerCard, ProposalForm, ProposalManager, TaskCheckout, Toaster
  context/AuthContext.js
  lib/api.js          # fetch wrapper with credentials:'include'
```

## Getting started

You need Node 18+ and a MongoDB Atlas connection string.

```bash
# Backend (terminal 1)
cd backend
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev                 # http://localhost:5000

# Frontend (terminal 2)
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # http://localhost:3000
```

## Environment variables

**Backend (`backend/.env`)** — gitignored, travels with the folder on the pendrive.
| Var | Purpose |
|-----|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | secret used to sign JWTs |
| `CLIENT_ORIGIN` | frontend URL for CORS (falls back to reflect if unset) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth (placeholder) |
| `NODE_ENV` | `production` on Vercel |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | used by `scripts/seedAdmin.js` |

**Frontend (`frontend/.env.local`)**
| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_API_URL` | backend API base, e.g. `https://skillservar.vercel.app/api` |

## API reference (mounted under `/api`)
**Auth**
- `POST /auth/register` `{name,email,password,image?,role}` → `{user}`
- `POST /auth/login` `{email,password}` → sets cookie, returns `{user}`
- `POST /auth/logout` → clears cookie
- `GET  /auth/me` → current user
- `GET  /auth/google`, `GET /auth/google/callback` (placeholder OAuth)

**Tasks**
- `GET  /tasks?search=&category=&page=&limit=9` → `{tasks,page,totalPages,total}` (each task has `proposals_count`)
- `GET  /tasks/mine` (client)
- `GET  /tasks/:id` (public; includes `proposals` if owner)
- `POST /tasks` (client) `{title,category,description,budget,deadline}`
- `PUT  /tasks/:id` (owner)
- `DELETE /tasks/:id` (owner)
- `POST /tasks/:id/proposals` (freelancer) `{proposed_budget,estimated_days,cover_note}`
- `GET  /tasks/:id/proposals` (owner)

**Proposals**
- `GET  /proposals/mine` (freelancer) → proposals with embedded `task`
- `PUT  /proposals/:id` `{status:'accepted'|'rejected'}` (owner; accepting sets task `in_progress`)

**Users**
- `GET  /users/explore` (auth)
- `GET  /users/:id` (auth)
- `PUT  /users/me` `{name,bio,image,skills}` (auth)

**Freelancers**
- `GET  /freelancers?search=&category=&page=&limit=9` → `{freelancers,page,totalPages,total}`
- `GET  /freelancers/:id` (lookup by `_id` or `fl_` id)

**Admin** (requireRole `admin`)
- `GET /admin/stats`, `GET /admin/users`, `DELETE /admin/users/:id`
- `GET /admin/tasks`, `DELETE /admin/tasks/:id`
- `GET /admin/transactions`

**Payments** (dummy)
- `POST /payments/checkout` `{task_id}` (client) → marks task `completed`

**Reviews**
- `POST /reviews` `{task_id,reviewee_email,rating,comment}` (client, task must be `completed`)
- `GET  /reviews?freelancer_email=` (public)

## Deployment (Vercel)
Two Vercel projects from this one repo:
- **Frontend** project root = `frontend`
- **Backend** project root = `backend` (uses `vercel.json` rewrite + `api/index.js`)

Set the environment variables from the `.env.example` files in each Vercel project.
The database is MongoDB Atlas, so no local DB is needed — only internet.

## Notes
- Stripe and Google OAuth are **dummy / placeholder** flows (no real payments/OAuth).
- Auth uses an HTTPOnly `ss_token` cookie; `middleware/auth.js` reads it from the
  `Authorization` header or the cookie and attaches `req.user`.
- `AGENTS.md` holds the full architecture and implementation roadmap.

## Scripts
- Backend: `npm run dev` (nodemon), `node scripts/seedAdmin.js` (seed admin).
- Frontend: `npm run dev`, `npm run build`, `npm run lint`.
