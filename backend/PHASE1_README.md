# GatePassX Backend API - Phase 1

## Overview

This is the Laravel 13 REST API backend for the GatePassX event management platform. Phase 1 includes core authentication, user management, organization management, and event management.

## Technology Stack

- **Framework**: Laravel 13
- **Database**: SQLite (development) / MySQL 8+ (production)
- **Authentication**: Laravel Sanctum (Token-based API authentication)
- **API Format**: RESTful JSON

## Database Schema (Phase 1)

### Tables Created

1. **users** - User accounts with roles
2. **organizations** - Event organizing entities
3. **events** - Event definitions
4. **pass_types** - VIP, Guest, Staff, etc.
5. **passes** - Individual gate passes (with QR signatures)
6. **devices** - Mobile device registration (for Android/Flutter scanners)
7. **scans** - Scan logs with validation results
8. **audit_logs** - Complete audit trail of all actions
9. **personal_access_tokens** - Sanctum API tokens

## Installation & Setup

### Prerequisites

- PHP 8.4+
- Composer
- SQLite or MySQL 8+

### Setup Steps

```bash
# Install dependencies
composer install

# Set up environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations with seed data
php artisan migrate:fresh --seed
```

## Database Configuration

### SQLite (Development)
```env
DB_CONNECTION=sqlite
```

### MySQL (Production)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gatepassx
DB_USERNAME=root
DB_PASSWORD=your_password
```

## Running the Server

```bash
# Development server
php artisan serve

# Server will run on http://localhost:8000
```

## API Endpoints (Phase 1)

### Authentication

**POST** `/api/login`
- Login with username and password
- Returns API token (1 hour expiry)
- Request: `{ "username": "admin", "password": "password123" }`

**POST** `/api/logout` (Authenticated)
- Logout and revoke token

**GET** `/api/me` (Authenticated)
- Get current authenticated user info

**POST** `/api/refresh` (Authenticated)
- Refresh the API token (1 hour expiry)

### Users (Authenticated)

**GET** `/api/users`
- List all users (pagination)
- Super Admin sees all, Organizer sees org users only

**POST** `/api/users`
- Create new user (Super Admin only)
- Request: `{ "username": "...", "email": "...", "password": "...", "role": "...", "organization_id": null }`

**GET** `/api/users/{id}`
- Get specific user

**PUT** `/api/users/{id}`
- Update user (email, role, organization)

**DELETE** `/api/users/{id}`
- Delete user (Super Admin only)

### Organizations (Authenticated)

**GET** `/api/organizations`
- List all organizations with user/event counts (Super Admin only)

**POST** `/api/organizations`
- Create organization (Super Admin only)
- Request: `{ "name": "...", "metadata": {...} }`

**GET** `/api/organizations/{id}`
- Get organization with users and events

**PUT** `/api/organizations/{id}`
- Update organization (Super Admin only)

**DELETE** `/api/organizations/{id}`
- Delete organization (Super Admin only)

### Events (Authenticated)

**GET** `/api/events`
- List events (filtered by role)
- Super Admin sees all
- Organizer sees their organization's events
- GateMan sees only active events

**POST** `/api/events`
- Create event (Organizer or Super Admin)
- Request: `{ "organization_id": 1, "name": "...", "date": "2026-07-20", "location": "..." }`
- Auto-generates event_secret for QR signature generation

**GET** `/api/events/{id}`
- Get event with pass types and passes

**PUT** `/api/events/{id}`
- Update event (creator or Super Admin only)
- Cannot update locked events

**PUT** `/api/events/{id}/lock`
- Lock event to prevent modifications (Super Admin only)

**DELETE** `/api/events/{id}`
- Delete event (Super Admin only)

## Test Data (Seeded)

### Users

| Username | Password | Role | Organization |
|----------|----------|------|--------------|
| admin | password123 | super_admin | - |
| organizer1 | password123 | organizer | Tech Conference 2026 |
| gateman1 | password123 | gateman | - |
| gateman2 | password123 | gateman | - |

### Sample Event

- **Name**: Tech Summit 2026
- **Date**: 30 days from now
- **Location**: Convention Center, New York
- **Pass Types**: VIP, Guest, Staff, Speaker
- **Sample VIP Passes**: 5 pre-created with HMAC-SHA256 signatures

## Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer {token}
```

Token format: `{id}|{hash}`

Tokens expire after 1 hour. Use `/api/refresh` to get a new token.

## User Roles & Permissions

### Super Admin
- Create/update/delete users
- Create/update/delete organizations
- Create/update/delete events
- Lock events
- Approve/revoke devices
- View audit logs

### Organizer
- Create/update events in their organization
- View/manage users in their organization
- Generate passes for their events
- View attendance reports

### GateMan
- Scan QR codes (in Phase 2+)
- View active events and passes
- Cannot edit or create

## Error Responses

All errors return JSON with status code and message:

```json
{
    "message": "Error description",
    "errors": {
        "field": ["Error message"]
    }
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 500: Server Error

## Next Steps (Phase 2)

- QR code generation with HMAC-SHA256 signatures
- Pass generation UI
- Event package (GPX) with encryption
- Offline validation logic

## Testing

```bash
# Run migrations with seed data
php artisan migrate:fresh --seed

# Then test API with curl or Postman
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/                 # API controllers
│   │           ├── AuthController.php
│   │           ├── UserController.php
│   │           ├── OrganizationController.php
│   │           └── EventController.php
│   └── Models/                      # Eloquent models
│       ├── User.php
│       ├── Organization.php
│       ├── Event.php
│       ├── PassType.php
│       ├── Pass.php
│       ├── Device.php
│       ├── Scan.php
│       └── AuditLog.php
├── database/
│   ├── migrations/                  # Database schemas
│   └── seeders/
│       └── DatabaseSeeder.php       # Test data
├── routes/
│   └── api.php                      # API route definitions
├── bootstrap/
│   └── app.php                      # Application bootstrap
├── config/
│   └── sanctum.php                  # Sanctum configuration
└── .env                             # Environment configuration
```

## Documentation

For Phase 2+ planning, see the main project plan at `/memories/session/plan.md`

---

**Status**: ✅ Phase 1 Complete - Backend Core, Auth, and Core APIs
