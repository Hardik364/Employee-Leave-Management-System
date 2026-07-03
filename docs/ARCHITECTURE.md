# Architecture

## Overview

The system is a classic **client–server** application:

```
┌────────────┐     HTTPS/JSON      ┌────────────────┐      SQL       ┌──────────────┐
│  React SPA │  ───────────────▶   │  Express API   │  ──────────▶   │   Database   │
│  (Vite)    │  ◀───────────────   │  (Node.js)     │  ◀──────────   │ SQLite / PG  │
└────────────┘   Bearer JWT        └────────────────┘   Sequelize    └──────────────┘
```

## Backend

Layered, single-responsibility structure:

```
routes/        HTTP surface — path + method → middleware → controller
middleware/    auth (JWT + RBAC), validation, error handling
controllers/   request/response orchestration
models/        Sequelize models + associations (data layer)
validators/    express-validator rule sets
utils/         cross-cutting helpers (tokens, ApiError, asyncHandler)
config/        env, database, logger, swagger
```

**Request flow:** `route → validate → authenticate → authorize → controller → model → response`.
Errors bubble to a single `errorHandler` that normalizes Sequelize/operational
errors into a consistent JSON envelope.

**Auth:** stateless JWT. The access token carries `{ sub, email, role }`; the
`authorize()` middleware enforces role-based access. A refresh endpoint issues new
access tokens so sessions survive without storing state server-side.

## Frontend

```
context/      AuthContext (session) + ThemeContext (dark mode)
api/          axios client with token attach + silent refresh interceptor
components/   reusable UI (Navbar, ProtectedRoute, Modal, StatCard, …)
pages/        route-level screens (employee + manager)
```

`ProtectedRoute` guards authenticated areas and enforces role boundaries on the
client, mirroring the backend's authorization for a smooth UX (the server remains
the source of truth).

## Key Decisions

- **SQLite by default** — zero-setup so reviewers can run the project instantly;
  the Sequelize models and schema are portable to PostgreSQL by changing one env var.
- **Managers as employees** — a single `employees` table with a `role` column keeps
  the schema normalized and avoids a duplicate users table.
- **Consistent response envelope** — every endpoint returns
  `{ success, message, data?, pagination?, errors? }` for predictable client handling.
- **Separation of concerns** — validation, authorization, business logic, and data
  access live in distinct layers, keeping controllers thin and testable.
