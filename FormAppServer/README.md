# FormAppServer

ASP.NET Core 9 Web API — backend for the FormApp project.

---

## Tech Stack

| Concern | Package | Version |
|---|---|---|
| Framework | .NET / ASP.NET Core | **9.0** |
| ORM | Microsoft.EntityFrameworkCore | 9.0.0 |
| Database | Microsoft.EntityFrameworkCore.Sqlite | 9.0.0 |
| EF Tooling | EF Core Tools + Design | 9.0.0 |
| Authentication | Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 |
| JWT tokens | System.IdentityModel.Tokens.Jwt | 8.6.0 |
| Password hashing | BCrypt.Net-Next | 4.0.3 |
| Excel export | ClosedXML | 0.104.2 |
| API docs | Swashbuckle.AspNetCore | 10.1.4 |
| JSON | Microsoft.AspNetCore.Mvc.NewtonsoftJson | 9.0.0 |

---

## Running the project

1. Open `FormAppServer.sln` in Visual Studio 2022 (v17.8+) or Rider.
2. Restore NuGet packages (automatic on first build).
3. Run the project — it starts on `http://localhost:3190`.
4. Open Swagger UI at: `http://localhost:3190/swagger`

---

## Project structure

```
FormAppServer/
├── Controllers/        # HTTP endpoints (MVC controllers)
├── DTOs/               # Request / Response data transfer objects
├── Models/             # EF Core domain entities
├── Data/               # AppDbContext + migrations
├── Services/           # Business logic (AuthService, FormsService, etc.)
├── Middleware/         # Error handling middleware
├── Helpers/            # Utility classes (JWT generation, etc.)
├── Program.cs          # App bootstrap + service registration
└── appsettings.json    # Config — DB connection string, JWT settings
```

---

## Domain models

### User
Stores registered users. Passwords are **never stored in plain text** — only the BCrypt hash.

| Field | Type | Notes |
|---|---|---|
| Id | int | PK |
| Email | string | Unique index |
| PasswordHash | string | BCrypt hash |
| Role | string | `"admin"` or `"user"` |
| CreatedAt | DateTime | UTC |

### Form
A form created by an admin, containing an ordered list of fields.

| Field | Type | Notes |
|---|---|---|
| Id | int | PK |
| Title | string | Max 200 chars |
| Description | string | Max 1000 chars |
| CreatedAt | DateTime | UTC |
| CreatedByUserId | int | FK → User |

### FormField
One field inside a form.

| Field | Type | Notes |
|---|---|---|
| Id | int | PK |
| FormId | int | FK → Form (cascade delete) |
| Label | string | Max 300 chars |
| FieldType | string | `text` \| `number` \| `textarea` \| `select` \| `checkbox` |
| IsRequired | bool | |
| Order | int | 0-based display order |
| Options | string? | JSON array — only used when FieldType is `select` |

### FormEntry
One submission of a form by a user.

| Field | Type | Notes |
|---|---|---|
| Id | int | PK |
| FormId | int | FK → Form (cascade delete) |
| SubmittedByUserId | int | FK → User (restrict delete) |
| SubmittedAt | DateTime | UTC |

### EntryValue
The value entered for one field in one submission.

| Field | Type | Notes |
|---|---|---|
| Id | int | PK |
| FormEntryId | int | FK → FormEntry (cascade delete) |
| FormFieldId | int | FK → FormField (restrict delete) |
| Value | string | Always stored as string; checkboxes use `"true"` / `"false"` |

---

## Configuration

Edit `appsettings.json` before running:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=formapp.db"
  },
  "Jwt": {
    "Key": "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32_CHARS_MIN",
    "Issuer": "FormAppServer",
    "Audience": "FormAppClient",
    "ExpiryMinutes": 60
  }
}
```

> **Important:** Replace `Key` with a strong random secret before deploying. Never commit the real key to source control.

---

## Swagger

Swagger UI is available in **Development** mode only at:

```
http://localhost:3190/swagger
```

To test protected endpoints, click **Authorize** in Swagger UI and enter:
```
Bearer <your_jwt_token>
```
