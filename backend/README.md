# SkillSwap — Backend

The SkillSwap REST API, built on **Express 4 + Mongoose 8** with **MongoDB Atlas**.
The same codebase runs locally (`npm run dev`) and on Vercel as a serverless function
via `api/index.js` + `vercel.json`.

![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20HTTPOnly%20Cookie-4f46e5)
![Stripe](https://img.shields.io/badge/Stripe-Demo%20mode-635bff?logo=stripe)

---

## Overview

- REST API mounted under `/api/*` (`app.use('/api/...', router)` in `src/app.js`).
- **Mongoose** models for `User`, `Client`, `Freelancer`, `Task`, `Proposal`,
  `Payment`, `Review`, `Notification`, `WithdrawalRequest`, and `SwapRequest`.
- **JWT** authentication with the token stored in an HTTPOnly `ss_token` cookie;
  `src/middleware/auth.js` also accepts the token via the `Authorization` header
  and attaches `req.user`. Helper middleware: `requireRole`, `requireApproved`,
  `optionalAuth`, and `admin`.
- **Stripe** integration is in **demo (dummy) mode by default** — payments are
  recorded in MongoDB without contacting Stripe. Set `STRIPE_SECRET_KEY` (and the
  matching publishable key on the frontend) to switch to real Stripe Checkout.
- **Google OAuth** is a placeholder flow driven by env vars; the placeholder
  callback works without live keys.
- `config/db.js` caches the Mongoose connection so it's safe to reuse across
  Vercel serverless invocations.
- `src/index.js` (local dev) auto-kills any stale process on port 5000 on
  Windows before listening — wrapped in `try/catch` so non-Windows machines
  start fine.

---

## Tech & dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | `^4.19.2` | HTTP framework |
| `mongoose` | `^8.5.1` | MongoDB ODM (Atlas in production) |
| `jsonwebtoken` | `^9.0.2` | Sign / verify JWTs |
| `bcryptjs` | `^2.4.3` | Password hashing |
| `cookie-parser` | `^1.4.7` | Read the `ss_token` cookie |
| `cors` | `^2.8.5` | CORS (reflected origin, `credentials: true`) |
| `helmet` | `^8.3.0` | Sensible security headers |
| `dotenv` | `^16.4.5` | Load `.env` files |
| `stripe` | `^14.25.0` | Stripe SDK (used when `STRIPE_SECRET_KEY` is set) |

Dev: `nodemon` (`^3.1.4`).

---

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in real values. `.env` is
gitignored. In production these values live in the Vercel project's
**Environment Variables** panel.

| Var | Required? | Purpose |
|---|---|---|
| `PORT` | no | Local HTTP port (default `5000`) |
| `NODE_ENV` | no | `development` locally, `production` on Vercel |
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `JWT_SECRET` | yes | Secret used to sign JWTs — use a long random string |
| `CLIENT_ORIGIN` | recommended | Frontend URL for CORS, e.g. `http://localhost:3000` |
| `CLIENT_URL` | recommended | Frontend URL used to build Stripe success/cancel redirects |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth client ID (placeholder-friendly) |
| `GOOGLE_CLIENT_SECRET` | optional | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | optional | Google OAuth redirect URI |
| `ADMIN_EMAIL` | yes (for `npm run seed`) | Email used by the admin seed script |
| `ADMIN_PASSWORD` | yes (for `npm run seed`) | Password used by the admin seed script |
| `STRIPE_SECRET_KEY` | optional | Stripe secret key. Leave blank to run in demo mode. |
| `STRIPE_WEBHOOK_SECRET` | reserved | Reserved for a future Stripe webhook route. Not consumed in demo mode. |

---

## npm scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `nodemon src/index.js` | Local dev with auto-restart on changes |
| `start` | `node src/index.js` | Run with plain `node` (also used by Vercel's Node runtime) |
| `seed` | `node scripts/seedAdmin.js` | Seed the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |

### Common commands
```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5000
npm run seed         # one-time: ensure admin exists
```

---

## Project structure

```
backend/
├── api/
│   └── index.js                 # Vercel serverless handler (imports src/app.js)
├── src/
│   ├── app.js                   # Express app: helmet, cors, cookieParser, json, /api routes, error handler
│   ├── index.js                 # Local dev entry: kills stale :5000, then app.listen
│   ├── config/
│   │   ├── db.js                # Cached Mongoose connection (serverless-safe)
│   │   └── stripe.js            # Stripe client (null in demo mode)
│   ├── lib/
│   │   ├── fees.js              # 3% platform + 5% VAT + Stripe processing math
│   │   └── payments.js          # Checkout / release / refund helpers
│   ├── middleware/
│   │   └── auth.js              # JWT verify → req.user, requireRole, requireApproved, optionalAuth, admin
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Freelancer.js
│   │   ├── Task.js
│   │   ├── Proposal.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Notification.js
│   │   ├── WithdrawalRequest.js
│   │   └── SwapRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── freelancers.js
│   │   ├── tasks.js
│   │   ├── proposals.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   ├── notifications.js
│   │   ├── onboarding.js
│   │   ├── admin.js
│   │   └── swaps.js
│   ├── utils/
│   │   └── cache.js
│   └── scripts/
│       └── seedAdmin.js         # Upserts an admin User from ADMIN_EMAIL / ADMIN_PASSWORD
├── vercel.json                  # Rewrites all routes → /api
├── .env.example
└── package.json
```

---

## API reference

> All authenticated endpoints accept the JWT either as `Authorization: Bearer <token>`
> or in the `ss_token` HTTPOnly cookie. Role-restricted routes use `requireRole(…)`
> middleware and respond `403` if the caller's role doesn't match.

### Auth — `/api/auth`
- `POST /register` `{name,email,password,image?,role}` → `{user}`
- `POST /login` `{email,password}` → sets cookie, returns `{user}`
- `POST /logout` → clears cookie
- `GET  /me` → current user
- `GET  /google`, `GET /google/callback` — placeholder OAuth

### Users — `/api/users` (auth required)
- `GET  /explore`
- `GET  /:id`
- `PUT  /me` `{name,bio,image,skills}`

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
- `POST /` (client, approved)
- `PUT  /:id` `{status:'accepted'|'rejected'}` (owner; accept → task `in_progress`)
- `POST /:id/deliver` (freelancer, approved)

### Payments — `/api/payments`
- `POST /checkout` `{task_id}` (client, approved) — records payment (demo or Stripe)
- `POST /release` (auth, approved) — release escrow to the freelancer
- `POST /refund` (client, approved) — refund a paid task
- `GET  /mine` (auth) — current user's wallet / transaction list
- `GET  /:id` (auth)

### Reviews — `/api/reviews`
- `POST /` (client) `{task_id,reviewee_email,rating,comment}`
- `GET  /?freelancer_email=` (public)

### Onboarding — `/api/onboarding`
- `GET  /metadata` (public)
- `GET  /client` · `GET /freelancer` (auth)
- `POST /client` (auth)
- `POST /freelancer` (auth)
- `PUT  /freelancer` (auth)

### Notifications — `/api/notifications` (auth required)
- `GET  /?page=&limit=&unread_only=`
- `PUT  /:id/read`
- `PUT  /read-all`

### Swaps — `/api/swaps` (auth required)
- `POST /` · `GET /` · `DELETE /:id` — direct task-swap requests between users

### Admin — `/api/admin` (admin only)
- `GET  /stats`
- **Users** — `GET /users` · `POST /users` · `PUT /users/:id` · `PUT /users/:id/block` · `DELETE /users/:id`
- **Tasks** — `GET /tasks` · `PUT /tasks/:id` · `PUT /tasks/:id/approve` · `DELETE /tasks/:id`
- **Reviews** — `GET /reviews` · `DELETE /reviews/:id`
- **Approvals** — `GET /approvals` · `PUT /approvals/approve-user/:id`
  · `PUT /approvals/reject-user/:id` · `PUT /approvals/sync-user/:id`
  · `GET /approvals/stats`
- **Transactions** — `GET /transactions`
- **Withdrawals** — `GET /withdrawals` · `PUT /withdrawals/:id/approve`
  · `PUT /withdrawals/:id/pay` · `PUT /withdrawals/:id/reject`

---

## Deployment (Vercel)

This project ships a Vercel config so the same repo can be deployed as a
**serverless** API:

- The Vercel project's **Root Directory** is `backend/`.
- `vercel.json` rewrites all incoming routes to `/api/*`, and `api/index.js`
  re-exports the shared Express `app` from `src/app.js`.
- Set the env vars from the table above in the Vercel project's
  **Environment Variables** panel.
- `src/index.js` is local-dev only; Vercel never calls it.

See the **repository root `README.md`** for the broader deployment picture
(frontend + backend on Vercel, MongoDB Atlas as the shared database).
