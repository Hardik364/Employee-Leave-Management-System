# API Documentation

Base URL: `http://localhost:5000/api`

All responses share a consistent envelope:

```json
{ "success": true, "message": "...", "data": { }, "pagination": { } }
```

Errors:

```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

Authentication uses **JWT Bearer tokens**. After logging in, send the access token
on protected routes:

```
Authorization: Bearer <accessToken>
```

Interactive docs (Swagger UI): **`/api/docs`** · Raw spec: `/api/docs.json`

---

## Auth

### POST `/auth/login`
Authenticate with email and password.

**Body**
```json
{ "email": "manager@company.com", "password": "Password123!" }
```
**200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "id": 1, "role": "manager", "...": "..." },
            "accessToken": "<jwt>", "refreshToken": "<jwt>" }
}
```
**401** — Invalid email or password.

### POST `/auth/refresh`
Body: `{ "refreshToken": "<jwt>" }` → new `accessToken` + `refreshToken`.

### POST `/auth/logout` 🔒
Stateless logout. **200** `{ "success": true }`.

### GET `/auth/me` 🔒
Returns the authenticated user.

---

## Leaves (Employee) 🔒

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/leaves`                   | Apply for leave                      |
| GET    | `/leaves`                   | List my leaves (search/filter/paginate) |
| GET    | `/leaves/{id}`              | Get one leave                        |
| PUT    | `/leaves/{id}`              | Edit a **pending** leave             |
| DELETE | `/leaves/{id}`              | Cancel a **pending** leave           |
| GET    | `/leaves/stats/summary`     | Employee dashboard totals + recent   |

**POST `/leaves` body**
```json
{ "leaveType": "casual", "startDate": "2026-07-10",
  "endDate": "2026-07-12", "reason": "Family function" }
```
`leaveType` ∈ `casual | sick | earned | unpaid | maternity | paternity`.

**GET `/leaves` query params:** `status`, `leaveType`, `search`, `page`, `limit`.

**201** returns the created leave. **400** on validation failure.

---

## Manager 🔒 (role: manager)

| Method | Endpoint                              | Description                     |
|--------|---------------------------------------|---------------------------------|
| GET    | `/manager/pending-leaves`             | All pending requests            |
| GET    | `/manager/leaves`                     | All requests (any status)       |
| PUT    | `/manager/leaves/{id}/approve`        | Approve a request               |
| PUT    | `/manager/leaves/{id}/reject`         | Reject (comments required)      |
| GET    | `/manager/employees/{id}/leaves`      | An employee's leave history     |
| GET    | `/manager/stats/summary`              | Manager dashboard statistics    |

**Reject body**
```json
{ "managerComments": "Insufficient balance for this period" }
```

---

## Employees 🔒 (role: manager)

| Method | Endpoint            | Description                         |
|--------|---------------------|-------------------------------------|
| GET    | `/employees`        | List/search employees (`search`, `department`) |
| GET    | `/employees/{id}`   | Get an employee by id               |

---

## Status Codes

| Code | Meaning                                             |
|------|-----------------------------------------------------|
| 200  | OK                                                  |
| 201  | Created                                             |
| 400  | Validation / bad request                            |
| 401  | Missing/invalid token or credentials                |
| 403  | Authenticated but not authorized (wrong role)       |
| 404  | Resource not found                                  |
| 409  | Conflict (e.g. duplicate email)                     |
| 429  | Too many requests (rate limited)                    |
| 500  | Internal server error                               |
