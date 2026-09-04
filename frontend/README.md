# SkillSwap — Frontend

The SkillSwap client application, built on **Next.js 14 (App Router, JavaScript)**
with Tailwind CSS. It serves both the public marketing site (Home, Browse Tasks,
Freelancers) and the authenticated app (client / freelancer / admin dashboards).

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)

---

## Overview

- App Router with route groups for public pages, dashboards, and admin areas.
- Cookie-based session: a JWT is read from the `ss_token` HTTPOnly cookie
  (or `Authorization: Bearer …` header) by the backend; the client
  bootstraps the user with `GET /api/auth/me` on first paint.
- Role-based routing via `<ProtectedRoute roles={[…]}>`; unauthorized users
  are redirected to `/login`.
- Theme: Electric Indigo & Violet (`brand #4F46E5`, `accent #7C3AED`).
  See `tailwind.config.js` and `src/app/globals.css`.

---

## Tech & dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `14.2.5` | App Router, image, font, metadata |
| `react` / `react-dom` | `^18.3.1` | UI runtime |
| `tailwindcss` | `^3.4.19` | Styling |
| `lucide-react` | `^0.460.0` | Icon set (Navbar, Sidebar, etc.) |
| `react-toastify` | `^11.1.0` | Toast notifications |
| `swr` | `^2.5.1` | Lightweight data fetching |
| `chart.js` | `^4.5.1` | Admin dashboard charts |
| `@stripe/stripe-js` | `^4.10.0` | Stripe Checkout client |

Dev dependencies: `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`.

The font **Plus Jakarta Sans** is loaded via `next/font/google` (see `src/app/layout.jsx`).

---

## Environment variables

Copy `frontend/.env.example` to `frontend/.env.local` and fill in real values.
`.env.local` is gitignored. In production these values live in the Vercel project's
**Environment Variables** panel.

| Var | Required? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Backend API base, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Stripe publishable key (`pk_test_…`). Leave blank to use the demo fallback. |

> Anything prefixed with `NEXT_PUBLIC_` is exposed to the browser. Never put secrets
> here.

---

## npm scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Start the dev server on `http://localhost:3000` |
| `build` | `next build` | Production build (`.next/`) |
| `start` | `next start` | Serve the production build |
| `lint` | `next lint` | Run ESLint (Next.js preset) |

### Common commands
```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
```

---

## Project structure

```
frontend/
├── public/
│   ├── icon.svg          # browser tab favicon (referenced by metadata.icons)
│   └── logo.svg          # in-page brand mark used by <Logo />
├── src/
│   ├── app/              # App Router routes
│   │   ├── layout.jsx    # Root layout: fonts, providers, ConditionalChrome
│   │   ├── page.jsx      # Home (Hero + featured)
│   │   ├── globals.css   # Tailwind layer + theme variables
│   │   ├── not-found.jsx # Custom 404
│   │   ├── error.jsx     # Client error boundary
│   │   ├── loading.jsx   # Global loading state
│   │   ├── about/        contact/  explore/  freelancers/  freelancers/[id]/
│   │   ├── login/  register/  onboarding/  onboarding/client/  onboarding/freelancer/
│   │   ├── profile/[id]/
│   │   ├── tasks/  tasks/[id]/  tasks/create/
│   │   ├── notifications/
│   │   ├── payments/success/  payments/cancel/
│   │   ├── admin/approvals/         # wrapped by app/admin/layout.jsx
│   │   └── dashboard/
│   │       ├── client/  client/my-tasks/
│   │       ├── freelancer/  freelancer/my-proposals/  freelancer/wallet/
│   │       ├── admin/  admin/users/  admin/tasks/  admin/transactions/
│   │       │          admin/withdrawals/  admin/reviews/
│   │       ├── profile/  settings/
│   │       └── page.jsx
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Logo.jsx
│   │   ├── Hero.jsx
│   │   ├── ConditionalChrome.jsx  # toggles Navbar/Footer vs DashboardSidebar
│   │   ├── DashboardSidebar.jsx   # role-aware sidebar used on app routes
│   │   ├── NotificationBell.jsx   # dropdown (navbar) / dropup (sidebar)
│   │   ├── ProtectedRoute.jsx
│   │   ├── Toaster.jsx
│   │   ├── Providers.jsx
│   │   ├── Skeletons.jsx
│   │   ├── dashboard/             # client/freelancer/admin widgets
│   │   └── withdraw/              # freelancer withdrawal UI
│   │
│   ├── context/
│   │   └── AuthContext.js         # cookie-based: /auth/me on load, login/logout
│   │
│   └── lib/
│       ├── api.js                 # fetch wrapper with credentials:'include'
│       ├── format.js
│       └── hooks.js
│
├── jsconfig.json                  # @/ → src/ alias for VS Code / TS
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── package.json
```

### Notable pieces

- **`src/app/layout.jsx`** — root layout. Loads Plus Jakarta Sans, wraps the tree in
  `AuthProvider` → `Providers` → `ConditionalChrome` (which decides between public
  chrome and the dashboard sidebar based on the current pathname).
- **`src/components/ConditionalChrome.jsx`** — keeps the public `Navbar`/`Footer`
  on routes like `/`, `/login`, `/explore`, and switches to `DashboardSidebar` on
  `/dashboard/*`, `/tasks/create`, `/admin/*`, and `/notifications`.
- **`src/context/AuthContext.js`** — calls `GET /api/auth/me` on mount to hydrate
  the user from the cookie, exposes `login`, `register`, and `logout`.
- **`src/lib/api.js`** — small `fetch` wrapper that prepends `NEXT_PUBLIC_API_URL`
  and always sends `credentials: 'include'`.
- **`src/components/NotificationBell.jsx`** — used in both the public `Navbar`
  (`position="dropdown"`) and the sidebar's user card / mobile top bar
  (`position="dropup"` / `position="dropdown"`). Shows a pulsing red dot for
  unread items, supports click-outside and `Esc` to close, and routes each
  notification row to the appropriate page (`/admin/approvals` for
  `account_approval` alerts, `/notifications` otherwise).

---

## Build & run

```bash
# from this directory
npm install
cp .env.example .env.local       # set NEXT_PUBLIC_API_URL at minimum
npm run dev                      # http://localhost:3000
```

For a production build:
```bash
npm run build
npm run start
```

See the **repository root `README.md`** for the full project context, deployment
notes, and the backend's API reference.
