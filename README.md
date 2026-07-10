# Wellpath — Healthcare Dashboard

A production-oriented healthcare platform with separate patient and admin portals, built as part of a Senior Full Stack Developer technical assessment.

**Repository:** [github.com/AnishRane13/Health-App](https://github.com/AnishRane13/Health-App)

## Live Deployment

| Service | URL |
|---|---|
| Frontend | https://health-app-khaki-one.vercel.app |
| Backend / API | https://health-app-7afy.onrender.com |
| API Health Check | https://health-app-7afy.onrender.com/api/health |

> **Note:** The backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle time may take 30–60 seconds to respond while the service wakes up.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Patient | `user1@example.com` | `password123` |
| Admin | `admin@healthapp.com` | `admin123` |

Any seeded client email (`user1@example.com` through `user5000@example.com`) works with `password123`.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Recharts, custom CSS design system |
| Backend | Node.js, Express 5, Prisma 7, JWT, bcrypt, Zod, Helmet, express-rate-limit |
| Database | PostgreSQL (Neon) |
| AI | Anthropic Claude API for health insight generation (optional — falls back to rule-based summaries if no API key is set) |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

### AI Insights (Anthropic API)

The **Explain my results** feature works out of the box without an API key. When `ANTHROPIC_API_KEY` is not set (as in the current live deployment), the backend automatically uses a **rule-based summary** built from your flagged lab metrics — so reviewers can test the full patient flow without any extra setup.

To enable **AI-generated insights** via Anthropic Claude, add a valid key to `server/.env` locally or to the Render environment variables:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Once a working key is in place and the server is restarted, the same **Explain my results** button will call the Anthropic API instead of the rule-based fallback. No frontend or code changes are required.


### Patient Portal (`/dashboard`, `/reports`)

- JWT-based login with protected routes and portal-aware redirects
- Landing page with patient and admin entry points
- Dashboard with personalized greeting, wellness score ring, and alert banners
- Latest lab report with color-coded metric flags (Normal / Low / High / Critical) against reference ranges
- Paginated report history
- Trend chart (BMI and fasting glucose over time)
- **Explain my results** — AI-generated or rule-based plain-language insight on demand
- Account settings modal (display name, email alerts preference — stored locally)
- Sign-out confirmation modal
- Collapsible sidebar with icons, skeleton loaders, toasts, and empty states
- Fully responsive (mobile sidebar, tablet, desktop)

### Admin Portal (`/admin`, `/admin/users`, `/admin/upload`)

- Role-restricted login (RBAC) — `ADMIN` role required
- Operations overview with KPI cards and flagged/critical patient alerts
- Patient search and filtering (name, email, city, health condition)
- Patient detail view with profile, flagged latest report, and full report history
- CSV upload for bulk health report import, with validation and an audit trail of every upload
- Batched inserts (1,000 rows per batch) for large file imports
- Recent import history on the dashboard overview

### Backend Highlights

- REST API with centralized error handling and Zod request validation
- Health metric flagging engine driven by seeded reference ranges
- Optional Anthropic integration with rule-based fallback for insights
- Self-service registration endpoint (links new accounts to existing client records by email)
- Upload audit logging (`csv_upload_logs`) with SUCCESS / PARTIAL / FAILED status

## Architecture

See [`architecture-diagram.png`](./architecture-diagram.png) for the full system diagram.

**High level:** React SPA (Vercel) → Express REST API (Render) → PostgreSQL (Neon). JWT is issued at login and verified via middleware on every protected route. Role (`USER` / `ADMIN`) is embedded in the JWT payload and enforced by route-level middleware.

```
Browser (React SPA)
    │  HTTPS + Bearer JWT
    ▼
Express API (Render)
    │  Prisma 7 + @prisma/adapter-pg
    ▼
PostgreSQL (Neon)
```

## Local Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon free tier recommended)

### 1. Clone and install

```bash
git clone https://github.com/AnishRane13/Health-App.git
cd Health-App

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**`server/.env`** (copy from `server/.env.example`):

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=          # optional — leave empty for rule-based insights; add a valid key for AI
PORT=5000
NODE_ENV=development
```

**`client/.env`** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

> **Production:** Set `CLIENT_URL` on Render to your Vercel URL (e.g. `https://health-app-khaki-one.vercel.app`). Set `VITE_API_URL` on Vercel to your Render API URL with no trailing slash.

### 3. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev
npm run seed          # loads 5,000 clients + 24,882 health reports from CSV
```

### 4. Run locally

```bash
# terminal 1 — API on http://localhost:5000
cd server && npm run dev

# terminal 2 — frontend on http://localhost:5173
cd client && npm run dev
```

## API Reference

A full Postman collection is included at [`postman_collection.json`](./postman_collection.json). Import it into Postman and set these variables:

| Variable | Local value | Production value |
|---|---|---|
| `baseUrl` | `http://localhost:5000` | `https://health-app-7afy.onrender.com` |
| `token` | _(set automatically after Login)_ | _(set automatically after Login)_ |

### Endpoint summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/auth/login` | — | Login → JWT |
| `POST` | `/api/auth/register` | — | Register (links to existing client by email) |
| `GET` | `/api/auth/me` | Bearer | Current user |
| `GET` | `/api/user/profile` | USER | Client profile |
| `GET` | `/api/user/reports/latest` | USER | Latest report + flags |
| `GET` | `/api/user/reports` | USER | Paginated report history |
| `GET` | `/api/user/trends` | USER | Time-series metrics |
| `POST` | `/api/user/insights` | USER | Generate health insight |
| `GET` | `/api/user/insights` | USER | Insight history |
| `GET` | `/api/admin/stats` | ADMIN | Dashboard KPIs |
| `GET` | `/api/admin/users` | ADMIN | Search/filter patients |
| `GET` | `/api/admin/users/:clientId` | ADMIN | Patient detail |
| `GET` | `/api/admin/users/:clientId/reports` | ADMIN | Patient reports |
| `POST` | `/api/admin/upload` | ADMIN | CSV upload (`file` field) |
| `GET` | `/api/admin/uploads` | ADMIN | Upload audit log |

## Technical Decisions

See [`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md) for the full write-up of key architectural and design decisions.

## Repository Structure

```
Health-App/
├── client/                    React + Vite frontend
│   ├── src/
│   │   ├── pages/             Landing, Login, User + Admin portals
│   │   ├── components/        Layout, health widgets, UI primitives
│   │   ├── context/           Auth + Toast providers
│   │   └── api/client.js      API client (VITE_API_URL)
│   └── vercel.json            SPA rewrites
├── server/                    Express + Prisma backend
│   ├── prisma/                Schema, migrations, seed scripts
│   ├── data/                  clients.csv, health_reports.csv
│   └── src/                   Routes, controllers, middleware, services
├── render.yaml                Render deployment blueprint
├── architecture-diagram.png
├── postman_collection.json
├── TECHNICAL_DECISIONS.md
└── README.md
```

## Seeded Data

| Dataset | Count |
|---|---|
| Clients | 5,000 |
| Health reports | 24,882 |
| Users | 5,001 (1 admin + 1 per client) |
| Metric reference ranges | 6 (hemoglobin, vitamin D, cholesterol, glucose, creatinine, BMI) |
