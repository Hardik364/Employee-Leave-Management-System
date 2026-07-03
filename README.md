# Employee Leave Management System

[![CI](https://github.com/Hardik364/Employee-Leave-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Hardik364/Employee-Leave-Management-System/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A full-stack **Employee Leave Management System (MVP)** that lets employees submit
and track leave requests while managers review, approve, or reject them — replacing
manual email/spreadsheet workflows with a centralized, role-based application.

> Built as a Full Stack Developer Intern technical assessment. Emphasis on clean
> architecture, maintainability, secure authentication, and thorough documentation.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Sample Login Credentials](#sample-login-credentials)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)

---

## Project Overview

Organizations often manage employee leave manually through emails and spreadsheets,
leading to delays, inconsistent approvals, duplicate records, and poor visibility.
This system digitizes the process with:

- Secure, role-based authentication (Employee / Manager)
- A guided leave-application and approval workflow
- Dashboards summarizing leave activity for both roles
- A documented REST API

## Features

**Authentication & Authorization**
- Email/password login with JWT access + refresh tokens
- Role-based access control (Employee, Manager)
- Protected routes on both frontend and backend
- Logout, validation, and clear error handling for invalid credentials

**Employee**
- View a personal dashboard (totals, recent activity)
- Apply for leave, edit/cancel pending requests
- View, search, and filter leave history by type or status

**Manager**
- View a dashboard (team totals, pending approvals)
- Review pending requests, approve, or reject with comments
- Search employees and view any employee's leave history

**Cross-cutting**
- Input validation, centralized error handling, request logging
- Security hardening (helmet, rate limiting, hashed passwords)
- Responsive UI with dark mode
- Swagger/OpenAPI + Postman API documentation

## Technology Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React (Vite), React Router, Context API, Axios, Tailwind CSS       |
| Backend   | Node.js, Express, Sequelize ORM                                   |
| Database  | SQLite (default) / PostgreSQL (configurable)                      |
| Auth      | JWT (access + refresh), bcrypt                                    |
| Docs      | Swagger (OpenAPI 3), Postman collection                          |
| Tooling   | Winston (logging), Helmet, express-rate-limit, express-validator |

## Folder Structure

```
Employee-Leave-Management-System/
├── backend/          # Express REST API (models, controllers, routes, middleware)
├── frontend/         # React (Vite) single-page application
├── database/         # SQL schema, ER diagram, seed notes
├── docs/             # API documentation & architecture notes
├── postman/          # Postman collection for the API
├── .env.example      # Sample environment configuration
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- (Optional) PostgreSQL, only if you switch `DB_DIALECT=postgres`

### Environment Variables
Copy the example file and adjust as needed:

```bash
cp .env.example backend/.env
```

See [`.env.example`](.env.example) for the full list of variables and their descriptions.

### Database Setup
By default the app uses **SQLite** — no external database is required. Tables are
created automatically on first run, and sample users/leaves are inserted via the
seed script. To use PostgreSQL instead, set `DB_DIALECT=postgres` and the
`DB_*` variables in `backend/.env`, then create the database.

### Backend Setup
```bash
cd backend
npm install
npm run seed      # create tables + sample data
npm run dev       # start API on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev       # start UI on http://localhost:5173
```

### Running the Application
1. Start the backend (`npm run dev` in `backend/`).
2. Start the frontend (`npm run dev` in `frontend/`).
3. Open http://localhost:5173 and log in with a sample account below.

### Run with Docker (optional)
The whole stack can be run with Docker — no local Node required:

```bash
docker compose up --build
# Frontend -> http://localhost:8080
# Backend  -> http://localhost:5000  (seeded automatically on first boot)
```

### Testing
Backend integration tests (Jest + Supertest, in-memory SQLite):

```bash
cd backend
npm test
```

Covers authentication, RBAC, validation, and the full leave lifecycle
(apply → edit → approve/reject). CI runs these on every push via GitHub Actions.

## API Documentation
- **Swagger UI:** http://localhost:5000/api/docs (interactive)
- **Postman:** import [`postman/Employee-Leave-Management.postman_collection.json`](postman/)
- **Reference:** see [`docs/API.md`](docs/API.md)

## Sample Login Credentials
After running `npm run seed`:

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Manager  | manager@company.com    | Password123!   |
| Employee | employee@company.com   | Password123!   |

## Bonus Features Implemented
- ✅ **JWT Refresh Tokens** — silent token refresh via an Axios interceptor
- ✅ **Role-Based Access Control (RBAC)** — enforced on both API and UI
- ✅ **Pagination** — on leave history, pending approvals, and employees
- ✅ **Search & Filtering** — by status, leave type, reason, and employee
- ✅ **Docker Support** — Dockerfiles + `docker-compose.yml`
- ✅ **Unit / Integration Testing** — Jest + Supertest
- ✅ **GitHub Actions (CI)** — automated test + build pipeline
- ✅ **Leave Duration Calculation** — inclusive day count on forms/details
- ✅ **Mobile Responsive Design** — Tailwind responsive layouts
- ✅ **Dark Mode** — persisted theme toggle
- ✅ **API Rate Limiting** — `express-rate-limit` on the API surface

For deeper design notes, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Assumptions
- A Manager can review requests from any employee (single-team MVP scope).
- Leave balance rules are simplified; see Future Enhancements.
- SQLite is sufficient for the MVP; the schema is portable to PostgreSQL.

## Known Limitations
- No email delivery (notifications are in-app / logged only).
- Single organization / single manager scope in the MVP.
- Refresh-token rotation is basic (no server-side revocation list).

## Future Enhancements
- Leave balance accrual and policy engine
- Email notifications
- Audit logs and reporting exports
- Multi-team / department hierarchy with delegated approvals
- CI/CD pipeline and containerized deployment

---

_Developed by Hardik Bajaj._
