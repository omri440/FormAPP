# FormApp — Forms & Users Management System

A full-stack web application for creating, distributing, and managing dynamic forms. Administrators build forms and review submissions; regular users fill out forms and track their own responses.

---

## Business Needs

Organizations often need a lightweight, self-hosted way to collect structured data from their users — onboarding questionnaires, feedback forms, job applications, and so on. FormApp addresses this by providing:

- **Role-based access** — admins control what forms exist; users can only submit and view their own responses.
- **Dynamic form building** — admins define any combination of field types without code changes.
- **Centralized submission management** — all responses are stored, searchable, and exportable as Excel or JSON.
- **Secure authentication** — BCrypt-hashed passwords and short-lived JWT tokens prevent unauthorized access.

---

## Technologies Used

### Backend
| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | .NET 9 | REST API framework |
| Entity Framework Core | 9.0 | ORM — code-first migrations |
| SQLite | via EF Core | Embedded SQL database |
| BCrypt.Net-Next | 4.0.3 | Password hashing |
| System.IdentityModel.Tokens.Jwt | 8.6.0 | JWT generation & validation |
| ClosedXML | 0.104.2 | Excel export |
| Swashbuckle (Swagger) | 10.1.4 | API documentation UI |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 19 | SPA framework |
| TypeScript | 5.x | Typed JavaScript |
| Angular Reactive Forms | built-in | Dynamic form builder with drag-and-drop reordering |
| Angular HTTP Client | built-in | API communication with JWT interceptor |
| Angular Router | built-in | Lazy-loaded routes with role guards |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerised builds for both services |
| Docker Compose | Single-command orchestration |
| Nginx | Serves the Angular SPA and handles client-side routing |

---

## Architecture Summary

```
FormApp/
├── docker-compose.yml          # Orchestrates backend + frontend
│
├── FormAppServer/              # ASP.NET Core Web API  →  :8080
│   └── FormAppServer/
│       ├── Controllers/        # AuthController, FormsController, SubmissionsController
│       ├── Services/           # Business logic (interfaces + implementations)
│       ├── DTOs/               # Request / response models (in-out pattern)
│       ├── Models/             # EF Core domain entities
│       ├── Data/               # DbContext + DatabaseSeeder
│       ├── Middleware/         # Centralized error handling (JSON responses)
│       └── Migrations/         # EF Core auto-generated migrations
│
└── FormAppClient/              # Angular 19 SPA  →  :80  (served by Nginx)
    └── src/app/
        ├── core/
        │   ├── guards/         # authGuard, roleGuard
        │   ├── interceptors/   # jwtInterceptor (attaches Bearer token)
        │   ├── models/         # TypeScript interfaces
        │   └── services/       # Auth, FormsService, SubmissionsService
        └── features/
            ├── auth/           # Login + Register pages
            ├── admin/          # Layout, Home dashboard, Form builder,
            │                   # Forms list, Submissions table, Analytics
            └── user/           # Layout, Dashboard (forms list), My Submissions,
                                # Form submission page
```

### Request Flow

```
Browser (Angular SPA — port 80)
    │  HTTP + Bearer JWT
    ▼
ErrorHandlingMiddleware  ← catches all unhandled exceptions → JSON error
    │
CORS → Authentication → Authorization
    │
Controller → Service → EF Core → SQLite
    │
DTO response
    ▼
Angular Client
```

### Auth Flow

1. User registers or logs in → server validates credentials, returns a JWT.
2. Angular stores the token in `localStorage` and decodes the payload to extract `role`.
3. Every subsequent request has `Authorization: Bearer <token>` attached by the JWT interceptor.
4. Admin-only endpoints require the `AdminOnly` policy (`role == "admin"` claim).
5. On login, admins are redirected to `/admin`; regular users go to `/dashboard`.

### Database Schema (Entity Relationships)

```
Users ──< Forms ──< FormFields
      ──< FormEntries ──< EntryValues
                FormFields ──< EntryValues
```

- **Users** — email (unique), BCrypt hash, role (`admin` | `user`)
- **Forms** — title, description, created by admin (FK → Users RESTRICT)
- **FormFields** — label, fieldType, isRequired, order, options JSON (FK → Forms CASCADE)
- **FormEntries** — one per submission (FK → Forms CASCADE, FK → Users RESTRICT)
- **EntryValues** — one per answered field (FK → FormEntries CASCADE, FK → FormFields RESTRICT)

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/forms` | Any user | List all forms |
| GET | `/api/forms/{id}` | Any user | Get form with fields |
| POST | `/api/forms` | Admin | Create form + fields |
| DELETE | `/api/forms/{id}` | Admin | Delete form |
| POST | `/api/forms/{id}/submit` | Any user | Submit form answers |
| GET | `/api/submissions` | Admin | All submissions |
| GET | `/api/submissions/my` | Any user | Current user's own submissions |
| GET | `/api/submissions/{id}` | Admin | Submission detail |
| GET | `/api/submissions/export/excel` | Admin | Download .xlsx |

---

## Setup Guide

### Prerequisite

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

No other tooling required on the host machine — .NET and Node.js run inside the containers.

### Run

```bash
docker compose up --build
```

Docker will build the .NET backend, build the Angular frontend, and start both services. On first start, EF Core migrations and the default admin seed run automatically inside the container.

| Service | URL |
|---|---|
| Frontend (Angular) | http://localhost |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |

### Stop

```bash
docker compose down
```

### Default admin credentials (seeded automatically)

| Email | Password |
|---|---|
| `admin@formapp.com` | `Admin1234!` |

---

## Usage

| Role | How to access | Capabilities |
|---|---|---|
| Admin | Login with seeded credentials | Create & delete forms, view all submissions, export Excel & JSON, view analytics chart |
| User | Register a new account at `/auth/register` | Fill out forms, view own submission history with answer detail |

---

## Advanced Features Implemented

1. **Security** — BCrypt password hashing, JWT with role claims, `AdminOnly` named policy, centralized error-handling middleware returning consistent JSON errors.
2. **Export** — Excel export via ClosedXML (dynamic columns per field label) and client-side JSON blob export.
3. **Analytics** — Submission count per form rendered as a CSS horizontal bar chart in the admin dashboard.

---

## Deliverables

- `FormAppServer/` — ASP.NET Core Web API
- `FormAppClient/` — Angular 19 SPA
- `docker-compose.yml` — single-command deployment
- `schema.sql` — full SQL schema with FK relationships and comments
- `README.md` — this document
