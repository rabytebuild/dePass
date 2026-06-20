# GatePassX - Secure Event E-GatePass Platform

## 🎯 Project Status

### Phase 1: Backend Core & Database ✅ COMPLETE
- ✅ Laravel 13 project initialized
- ✅ Database schema: 8 tables with proper relationships
- ✅ Eloquent models with relationships
- ✅ Sanctum API token authentication
- ✅ User management API (CRUD)
- ✅ Organization management API (CRUD)
- ✅ Event management API (CRUD)
- ✅ Test data seeded
- ✅ Database ready (SQLite dev, MySQL production ready)

### Current Implementation

**Backend**: `/backend` - Laravel 13 REST API
- **Auth**: Token-based (Sanctum) - 1 hour expiry
- **Database**: SQLite (dev) / MySQL 8+ (production)
- **Status**: 7 API resource endpoints + 3 auth endpoints

**Mobile**: Pending (Phase 3)
**Admin Panel**: Pending (Phase 4)

## 🏗️ Architecture Overview

### Tech Stack (Confirmed)
- Backend: Laravel 13 + Sanctum
- Database: MySQL 8
- Mobile: Flutter + Dart
- Admin Panel: React
- Authentication: JWT tokens (1hr) + Refresh
- Security: Argon2id hashing, HMAC-SHA256 QR signatures

### Database Tables
1. `users` - Roles: super_admin, organizer, gateman
2. `organizations` - Organizations for event grouping
3. `events` - Event definitions with secrets
4. `pass_types` - VIP, Guest, Staff, Speaker, etc.
5. `passes` - Individual QR passes (pass_uid + signature)
6. `devices` - Mobile device registration & approval
7. `scans` - Scan logs with results
8. `audit_logs` - Complete action audit trail

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Test Users (Seeded)
- **admin** (super_admin): password123
- **organizer1** (organizer): password123
- **gateman1** (gateman): password123
- **gateman2** (gateman): password123

## 📋 API Endpoints Summary (Phase 1)

### Auth (Public)
- `POST /api/login` - Get token
- `POST /api/logout` - Revoke token (auth required)
- `GET /api/me` - Current user (auth required)
- `POST /api/refresh` - Refresh token (auth required)

### Users (Auth Required)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Organizations (Auth Required)
- `GET /api/organizations` - List orgs (admin only)
- `POST /api/organizations` - Create org (admin only)
- `GET /api/organizations/{id}` - Get org
- `PUT /api/organizations/{id}` - Update org (admin only)
- `DELETE /api/organizations/{id}` - Delete org (admin only)

### Events (Auth Required)
- `GET /api/events` - List events (filtered by role)
- `POST /api/events` - Create event
- `GET /api/events/{id}` - Get event
- `PUT /api/events/{id}` - Update event
- `PUT /api/events/{id}/lock` - Lock event (admin only)
- `DELETE /api/events/{id}` - Delete event (admin only)

## 📁 Project Structure

```
/workspaces/dePass/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/    # API controllers
│   │   └── Models/                  # Eloquent models
│   ├── database/
│   │   ├── migrations/              # Schema
│   │   └── seeders/                 # Test data
│   ├── routes/
│   │   └── api.php                  # API routes
│   ├── PHASE1_README.md             # Phase 1 docs
│   └── .env                         # Config (SQLite dev)
├── mobile/                          # Phase 3
├── admin/                           # Phase 4
├── README.md                        # This file
└── track.md                         # Implementation tracking
```

## 🔐 Security Features (Phase 1)

✅ Sanctum token authentication (stateless)
✅ Argon2id password hashing
✅ Role-based access control (RBAC)
✅ Audit logging for all actions
✅ CORS enabled (configurable)
✅ Environment-based config

Coming in Phase 2+:
- HMAC-SHA256 QR signatures
- Device approval system
- Passkey/WebAuthn support
- Session timeouts with biometric re-auth

## 📊 Database Relationships

```
User (super_admin|organizer|gateman)
├── belongsTo Organization
├── hasMany created Events
├── hasMany Devices
└── hasMany AuditLogs

Organization
├── hasMany Users
├── hasMany Events
└── hasMany PassTypes

Event
├── hasMany PassTypes
├── hasMany Passes
└── hasMany Scans (through Pass)

Pass
├── hasMany Scans
└── belongsTo PassType

Device
├── hasMany Scans
└── belongsTo User

Scan
├── belongsTo Pass
└── belongsTo Device

AuditLog
└── belongsTo User
```

## 🎯 Next Steps (Phase 2: QR Engine)

Phase 2 will focus on:
1. QR code generation with HMAC-SHA256 signatures
2. Pass generation API (single & bulk modes)
3. Event package generation (encrypted `.gpx` files)
4. Offline validation logic for mobile

See full plan: `/memories/session/plan.md`

## 🧪 Testing

All endpoints are ready for testing:

```bash
# 1. Start server
cd backend && php artisan serve

# 2. Login to get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq -r '.token')

# 3. Use token for authenticated requests
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create event (example)
curl -X POST http://localhost:8000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": 1,
    "name": "DevCon 2026",
    "date": "2026-08-15",
    "location": "San Francisco Convention Center"
  }'
```

## 📚 Documentation

- [Phase 1 Detailed Docs](./backend/PHASE1_README.md)
- [Full Implementation Plan](./memories/session/plan.md) (see session memory)
- [Database Schema](./backend/database/migrations/) (migration files)

## 🔗 Project Links

- **Repo**: rabytebuild/dePass (main branch)
- **Tech Stack**: Laravel 13, Flutter, React, MySQL 8
- **Current Phase**: 1 of 6

---

**Last Updated**: 2026-06-20
**Status**: ✅ Phase 1 Complete - Ready for Phase 2 (QR Engine)
