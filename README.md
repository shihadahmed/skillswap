# SkillSwap

A full-stack freelance micro-task marketplace (Fiverr / TaskHive style) that connects
**clients** and **freelancers** through a verified, escrow-backed workflow with an
**admin moderation** panel for account approvals, transactions, and payouts.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![Express](https://img.shields.io/badge/Express-4-000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20HTTPOnly%20Cookie-4f46e5)
![Stripe](https://img.shields.io/badge/Stripe-Demo%20mode-635bff?logo=stripe)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)

---

## Overview

Clients post small, well-scoped tasks. Freelancers apply with proposals. The client
accepts one proposal, the freelancer delivers, the client pays (via dummy/demo Stripe
or real Stripe Checkout), and the client rates. Wallets hold client deposits and
freelancer earnings, with admin-approved withdrawals. An admin panel moderates new
account applications, transactions, and platform activity.

SkillSwap is built as a **monorepo of two deployable apps** (a Next.js frontend and an
Express API backend), sharing a single MongoDB Atlas cluster and a JWT-in-HTTPOnly-cookie
auth scheme.

---

## Tech stack

### Frontend (`frontend/`)
- **Next.js 14** (App Router, JavaScript)
- **React 18**, **Tailwind CSS 3**, **Plus Jakarta Sans** (via `next/font`)
- **Lucide React** icons, **react-toastify** notifications
- **SWR** for data fetching, **Chart.js** for admin analytics
- **Stripe.js** for client-side Checkout

### Backend (`backend/`)
- **Node.js 18+** with **Express 4**
- **Mongoose 8** on **MongoDB Atlas**
- **JWT** (`jsonwebtoken`) stored in an **HTTPOnly `ss_token` cookie**
- **bcryptjs** password hashing, **helmet**, **cookie-parser**, **CORS**
- **Stripe SDK 14** (demo / dummy by default; real Checkout opt-in via env keys)
- **Google OAuth** placeholder (env-driven, no live keys required)

### Theme
Electric Indigo & Violet — `brand #4F46E5`, `brand-hover #4338CA`, `accent #7C3AED`,
`bg #FAFAFB`, `surface #FFFFFF`, `ink #0F172A`, `muted #64748B`, `border #E2E8F0`.

---

## Repository structure

```
SkillSwap/
├── backend/                 # Express REST API + Mongoose models
│   ├── api/
│   │   └── index.js         # Vercel serverless handler (imports src/app.js)
│   ├── src/
│   │   ├── app.js           # Express app: helmet, cors, cookieParser, json, /api routes
│   │   ├── index.js         # Local dev entry (kills stale :5000, then listens)
│   │   ├── config/          # db.js (cached Mongoose), stripe.js
│   │   ├── lib/             # fees.js, payments.js
│   │   ├── middleware/      # auth.js (JWT verify → req.user, requireRole, requireApproved)
│   │   ├── models/          # User, Client, Freelancer, Task, Proposal, Payment,
│   │   │                    # Review, Notification, WithdrawalRequest, SwapRequest
│   │   ├── routes/          # auth, users, freelancers, tasks, proposals, payments,
│   │   │                    # reviews, notifications, onboarding, admin, swaps
│   │   ├── utils/cache.js
│   │   └── scripts/seedAdmin.js
│   ├── vercel.json          # rewrites all routes to /api
│   ├── .env.example
│   └── package.json
│
├── frontend/                # Next.js 14 client
│   ├── public/
│   │   ├── icon.svg         # browser tab favicon (also used by metadata.icons)
│   │   └── logo.svg         # in-page brand mark (used by <Logo />)
│   ├── src/
│   │   ├── app/             # App Router routes (see below)
│   │   ├── components/      # Navbar, Footer, Logo, Hero, ConditionalChrome,
│   │   │                    # NotificationBell, ProtectedRoute, Toaster, Providers,
│   │   │                    # Skeletons, dashboard/, withdraw/
│   │   ├── context/         # AuthContext.js (cookie-based /auth/me bootstrap)
│   │   └── lib/             # api.js (fetch + credentials:'include'), format.js, hooks
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── AGENTS.md                # Full architecture & implementation roadmap
└── README.md                # You are here
```

### Frontend route groups (`frontend/src/app/`)

| Path | Purpose |
|---|---|
| `/`, `/explore`, `/about`, `/contact` | Public marketing pages (Navbar + Footer) |
| `/login`, `/register`, `/onboarding/*` | Auth and profile-completion flows |
| `/tasks`, `/tasks/[id]`, `/tasks/create` | Browse, view, and post tasks |
| `/freelancers`, `/freelancers/[id]` | Browse and view freelancers |
| `/notifications` | All-notifications page (DashboardSidebar) |
| `/payments/success`, `/payments/cancel` | Stripe Checkout return URLs |
| `/dashboard/client/*` | Client dashboard (overview, my-tasks, profile, settings) |
| `/dashboard/freelancer/*` | Freelancer dashboard (overview, my-proposals, wallet) |
| `/dashboard/admin/*` | Admin dashboard (overview, users, tasks, transactions, withdrawals, reviews) |
| `/admin/*` | Admin operations pages (currently `/admin/approvals`) |
| `/dashboard/profile`, `/dashboard/settings` | Shared profile / settings |

---

## Quick start

### Prerequisites
- **Node.js 18+** and **npm**
- A **MongoDB Atlas** connection string (or any reachable MongoDB instance)
- Optional: **Stripe** test keys (otherwise the platform runs in demo mode)

### 1. Install dependencies
```bash
# from the repo root
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure environment

Both `.env.example` files are committed. Copy each one and fill in real values:
```bash
# backend
cp backend/.env.example  backend/.env

# frontend
cp frontend/.env.example frontend/.env.local
```

> `.env`, `.env.local`, and any `.env.vercel` are gitignored. They travel with the
> folder on a pendrive, so a second machine only needs `npm install` and `npm run dev`.

### 3. Seed the admin account (optional but recommended for first run)
```bash
cd backend
npm run seed
# uses ADMIN_EMAIL and ADMIN_PASSWORD from backend/.env
```

### 4. Run both apps (two terminals)
```bash
# terminal 1 — backend on http://localhost:5000
cd backend
npm run dev

# terminal 2 — frontend on http://localhost:3000
cd frontend
npm run dev
```

`backend/src/index.js` auto-kills any stale process on port 5000 on Windows and is
wrapped in `try/catch` so non-Windows machines start fine. The frontend reads
`NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`).

---

## Environment variables

### Backend (`backend/.env`)
| Var | Purpose |
|---|---|
| `PORT` | HTTP port for local dev (default `5000`) |
| `NODE_ENV` | `development` locally, `production` on Vercel |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_ORIGIN` | Frontend URL for CORS (e.g. `http://localhost:3000`) |
| `CLIENT_URL` | Frontend URL used to build Stripe success/cancel redirects |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth (placeholder-friendly) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `scripts/seedAdmin.js` and `npm run seed` |
| `STRIPE_SECRET_KEY` | Stripe secret key. Leave blank for demo (dummy) mode. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (reserved; webhook route is not active in demo mode) |

### Frontend (`frontend/.env.local`)
| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key. Leave blank to use the demo fallback. |

---

## Core features

### Roles
- **`client`** — post tasks, accept proposals, pay, review, manage wallet deposits.
- **`freelancer`** — browse tasks, submit proposals, deliver, earn, request withdrawals.
- **`admin`** — seeded (not self-registered). Moderates accounts, tasks, reviews, transactions, and payouts.

### Authentication
- Email + password with password rules (≥ 6 chars, 1 upper + 1 lower).
- JWT in HTTPOnly `ss_token` cookie; `middleware/auth.js` reads it from the
  `Authorization` header **or** the cookie and attaches `req.user`.
- Google OAuth as a placeholder flow (env-driven, no live keys required for grading).

### Dashboards
- **Client** — stats, post a task, manage proposals, dummy checkout, leave a review.
- **Freelancer** — stats, browse tasks, track own proposals, wallet + earnings.
- **Admin** — aggregate stats, manage users / tasks / reviews / transactions /
  withdrawals, plus the `/admin/approvals` workflow for new account verification.

### Tasks & proposals
- Create, browse (search + category filter + pagination 9/page), update, delete.
- Freelancers apply with a proposal. The client accepts one — other pending
  proposals are auto-rejected and the task moves to `in_progress`.
- Proposal delivery, client release of payment, and client-side refunds.

### Wallet & payouts
- Client-side deposit + freelancer earnings tracked in `Payment` documents.
- Freelancers can request withdrawals; admins approve / pay / reject them from
  `/api/admin/withdrawals/*`.

### Verification workflow
- New sign-ups land in `pending`. Admins approve or reject from `/admin/approvals`.
- Approved users get the verified badge and can post tasks / submit proposals.

### Notifications
- Server-side `Notification` records created on key events (proposal accepted, task
  approved, payment received, review received, account approval status, etc.).
- `NotificationBell` (dropdown in the public Navbar, dropup in the sidebar's
  user card) shows unread count, panel, and per-row navigation.

### Reviews / ratings
- Clients review freelancers after a task is completed. Average rating stored on the
  `User` document and exposed on the freelancer profile.

### Stripe integration
- Runs in **demo (dummy) mode** by default — payments are recorded in MongoDB
  without contacting Stripe.
- Set `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to switch to real
  Stripe Checkout.

---

## API reference (mounted under `/api`)

> All authenticated endpoints expect the JWT either as a Bearer header
> (`Authorization: Bearer <token>`) or in the `ss_token` HTTPOnly cookie.

### Auth — `/api/auth`
- `POST /register` `{name,email,password,image?,role}` → `{user}`
- `POST /login` `{email,password}` → sets cookie, returns `{user}`
- `POST /logout` → clears cookie
- `GET  /me` → current user
- `GET  /google`, `GET /google/callback` — placeholder OAuth

### Users — `/api/users`
- `GET  /explore` (auth)
- `GET  /:id` (auth)
- `PUT  /me` `{name,bio,image,skills}` (auth)

### Freelancers — `/api/freelancers`
- `GET  /?search=&category=&page=&limit=9` → `{freelancers,page,totalPages,total}`
- `GET  /:id`
- `POST /` (auth)

### Tasks — `/api/tasks`
- `GET  /?search=&category=&page=&limit=9` → `{tasks,page,totalPages,total}` (each task has `proposals_count`)
- `GET  /mine` (client)
- `GET  /:id` (public; includes `proposals` if owner)
- `POST /` (client, approved) `{title,category,description,budget,deadline}`
- `PUT  /:id` (owner)
- `DELETE /:id` (owner)
- `POST /:id/proposals` (freelancer, approved)
- `GET  /:id/proposals` (owner)

### Proposals — `/api/proposals`
- `GET  /mine` (freelancer)
- `POST /` (client, approved) — counter-proposal / direct invite
- `PUT  /:id` `{status:'accepted'|'rejected'}` (owner; accept → task `in_progress`)
- `POST /:id/deliver` (freelancer, approved)

### Payments — `/api/payments`
- `POST /checkout` `{task_id}` (client, approved) — records payment (demo or Stripe)
- `POST /release` (auth, approved) — release escrow to freelancer
- `POST /refund` (client, approved) — refund a paid task
- `GET  /mine` (auth) — current user's wallet transactions
- `GET  /:id` (auth)

### Reviews — `/api/reviews`
- `POST /` (client) `{task_id,reviewee_email,rating,comment}`
- `GET  /?freelancer_email=` (public)

### Onboarding — `/api/onboarding`
- `GET  /metadata` (public — category / skill data for the wizard)
- `GET  /client` · `GET /freelancer` (auth)
- `POST /client` · `POST /freelancer` · `PUT /freelancer` (auth)

### Notifications — `/api/notifications`
- `GET  /?page=&limit=&unread_only=` (auth)
- `PUT  /:id/read` (auth)
- `PUT  /read-all` (auth)

### Swaps — `/api/swaps`
- `POST /` · `GET /` · `DELETE /:id` (auth) — direct task-swap requests between users

### Admin — `/api/admin` (requireRole `admin`)
- `GET  /stats`
- Users: `GET /users` · `POST /users` · `PUT /users/:id` · `PUT /users/:id/block` · `DELETE /users/:id`
- Tasks: `GET /tasks` · `PUT /tasks/:id` · `PUT /tasks/:id/approve` · `DELETE /tasks/:id`
- Reviews: `GET /reviews` · `DELETE /reviews/:id`
- Approvals: `GET /approvals` · `PUT /approvals/approve-user/:id` · `PUT /approvals/reject-user/:id`
  · `PUT /approvals/sync-user/:id` · `GET /approvals/stats`
- Transactions: `GET /transactions`
- Withdrawals: `GET /withdrawals` · `PUT /withdrawals/:id/approve` · `PUT /withdrawals/:id/pay`
  · `PUT /withdrawals/:id/reject`

---

## Deployment (Vercel)

Two Vercel projects from this one repo:
- **Frontend** project — root directory `frontend/`
  (e.g. `https://skillswap-frontbit.vercel.app`).
- **Backend** project — root directory `backend/`, with `vercel.json` rewrite
  (e.g. `https://skillservar.vercel.app`).

Set the environment variables from each `.env.example` in the matching Vercel
project's **Environment Variables** panel. The database is MongoDB Atlas, so no
local database is needed — only internet.

`backend/src/index.js` is the local-dev entry; `backend/api/index.js` is the
Vercel serverless handler that imports the shared Express `app`.

---

## Notes

- **Stripe** and **Google OAuth** are **dummy / placeholder** flows by default
  (no real payments or OAuth). Both become real by setting the matching env keys.
- **Auth** uses an HTTPOnly `ss_token` cookie; `backend/src/middleware/auth.js`
  reads the token from the `Authorization` header or the cookie and attaches
  `req.user`. The frontend's `api.js` fetch wrapper always sends
  `credentials: 'include'`.
- The CORS config uses `origin: true, credentials: true` (reflects the request
  origin) so cookie auth works across the local dev ports and across the
  `skillswap-frontbit.vercel.app` ↔ `skillservar.vercel.app` boundary.
- `AGENTS.md` is the canonical architecture document and implementation roadmap
  for the project.

---

## Scripts

### Backend
- `npm run dev` — start with `nodemon` (auto-restart on changes)
- `npm start` — start with plain `node`
- `npm run seed` — seed the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### Frontend
- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run start` — start the production build
- `npm run lint` — run `next lint`
