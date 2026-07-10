# Technical Decisions — Wellpath

This document summarizes the main architectural and product decisions made while building the Health-App assessment project.

---

## 1. Monorepo layout: separate `client/` and `server/`

**Decision:** Keep frontend and backend as sibling packages without a root workspace orchestrator.

**Why:** The assessment scope maps cleanly to two deployable units (Vercel + Render). Each package has its own `package.json`, env files, and build pipeline. This avoids coupling release cycles and keeps deployment configs (`vercel.json`, `render.yaml`) at the obvious paths reviewers expect.

**Trade-off:** No shared TypeScript types between client and server. API contracts are enforced by Zod on the backend and manual client methods in `client/src/api/client.js`.

---

## 2. PostgreSQL on Neon + Prisma 7 with the PG adapter

**Decision:** Use Neon serverless PostgreSQL and Prisma 7 with `@prisma/adapter-pg` and a `pg` connection pool.

**Why:** Neon provides a free tier with SSL, branching-friendly workflows, and a connection string that works locally and on Render. Prisma 7 requires an explicit driver adapter for PostgreSQL in this setup; the adapter pattern keeps the ORM while using Neon's pooler host in production.

**Trade-off:** Slightly more boilerplate than `new PrismaClient()` alone, but necessary for Prisma 7 compatibility and predictable connection handling on a PaaS.

---

## 3. JWT in `localStorage` with role-based route guards

**Decision:** Issue JWTs at login containing `{ id, role, clientId }`. Store the token in `localStorage`. Protect API routes with `authenticate` + `authorize` middleware; protect frontend routes with a `ProtectedRoute` wrapper.

**Why:** Stateless auth scales well on Render's free tier (no session store). Embedding `role` in the token makes RBAC checks O(1) per request. Frontend guards improve UX; backend middleware is the real security boundary.

**Trade-off:** `localStorage` is vulnerable to XSS. For a demo/assessment scope this is acceptable; production hardening would add httpOnly cookies, refresh tokens, and stricter CSP.

---

## 4. Reference-range flagging instead of hard-coded thresholds in UI

**Decision:** Store clinical reference ranges in `health_metric_ranges` and compute LOW / NORMAL / HIGH / CRITICAL flags server-side in `healthFlags.js`.

**Why:** Keeps business logic centralized and consistent across user dashboard, admin detail views, and future reporting. Admins can update ranges without redeploying frontend color logic.

**Trade-off:** Ranges are seeded, not admin-editable in the UI yet.

---

## 5. AI insights with a rule-based fallback

**Decision:** `POST /api/user/insights` calls Anthropic Claude when `ANTHROPIC_API_KEY` is set; otherwise it generates a deterministic rule-based summary from flagged metrics.

**Why:** The feature must work in review environments without a paid API key. Persisting insights in `health_insights` allows future history UI without re-calling the model.

**Trade-off:** Only `REPORT_SUMMARY` is implemented in the UI. `TREND_ANALYSIS` and `WELLNESS_TIP` exist in the schema for extension.

---

## 6. Shared CSV ingest pipeline for seed and admin upload

**Decision:** One validation and parsing module (`server/src/utils/ingest.js`) powers both `prisma/seed.js` and `POST /api/admin/upload`.

**Why:** Guarantees that seeded data and live imports follow identical rules. Reduces drift between "works in dev" and "works in production upload."

**Trade-off:** Large uploads are synchronous within the request. For very large files, a job queue would be preferable.

---

## 7. Batched `createMany` for bulk inserts

**Decision:** Insert CSV rows in batches of 1,000 via `batchInsert.js`.

**Why:** Avoids memory spikes and PostgreSQL parameter limits when importing tens of thousands of reports. The seed script uses the same utility.

---

## 8. Custom CSS design system over a component library

**Decision:** No MUI, Chakra, or Tailwind. A single `index.css` defines CSS variables, typography (Fraunces + Source Sans 3), and component classes.

**Why:** The brief called for a polished, non-generic health product aesthetic. A bespoke system avoids the "AI dashboard" look and keeps bundle size small on Vercel's free tier.

**Trade-off:** Slower to build complex components; no built-in accessibility primitives from a library (mitigated with semantic HTML and ARIA on modals).

---

## 9. Wellness score computed on the frontend

**Decision:** The API returns per-metric flags; the wellness score (0–100) is calculated in `client/src/utils/wellnessScore.js`.

**Why:** The score is a presentation-layer summary derived from flags, not a stored clinical fact. Keeping it client-side avoids an extra endpoint and lets the algorithm iterate without migrations.

**Trade-off:** Score logic is not authoritative server-side; two clients could theoretically diverge if algorithms change.

---

## 10. Portal-aware auth UX

**Decision:** Login supports `?portal=patient|admin`. Logout and unauthenticated redirects return to the matching portal. `wellpath_last_portal` is persisted in `localStorage`.

**Why:** Admin and patient users share one app shell but have different mental models. Sending an admin to the patient login screen after logout was confusing in early testing.

---

## 11. Render + Vercel deployment split

**Decision:** Frontend on Vercel (static SPA + rewrites), backend on Render (Node web service), database external on Neon.

**Why:** Each platform's free tier fits one concern well. `render.yaml` documents the backend blueprint; `vercel.json` handles SPA routing. CORS is locked to `CLIENT_URL`.

**Trade-off:** Render free tier cold starts (30–60 s after idle). Documented in the README.

---

## 12. What was intentionally deferred

| Item | Reason |
|---|---|
| Registration UI | Backend endpoint exists; assessment focused on login flows with seeded users |
| Email alerts backend | Settings toggle is a UX placeholder stored locally |
| Automated tests | Time-boxed; manual Postman + UI testing used instead |
| Admin sort/filter for state/gender | API supports it; UI scoped to search + city + condition |
| Insight history page | Generate-on-demand covers the demo; list endpoint is ready |

---

## Summary

The architecture optimizes for **reviewability** (clear separation, live URLs, seeded realistic data), **security basics** (JWT RBAC, Zod validation, Helmet, rate-limited auth), and **product differentiation** (metric flagging, wellness score, AI insights with fallback, CSV audit trail) within a two-day assessment window.
