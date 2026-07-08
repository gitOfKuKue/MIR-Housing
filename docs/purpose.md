# MIR Housing — Project Purpose & Implementation Plan

## Overview

MIR Housing is an internal web application for managing company-owned rental properties. It is used by staff to view, create, update, and remove property records and related rental information — not a public-facing marketplace for tenants.

The goal is a simple, reliable admin tool that centralizes property data and keeps day-to-day rental operations in one place.

---

## Phase 1 Scope

Phase 1 delivers the core user journey and property management foundation. No implementation is required in this document — it defines what to build next.

### 1. Landing page (public)

- Company-branded landing page explaining the internal property management system
- Clear call-to-action: **Login** button
- Header and footer layout (shared shell)
- No property data visible without authentication

### 2. Authentication

- Login page (email/password or company-approved method via Supabase Auth)
- Redirect authenticated users to the properties dashboard
- Redirect unauthenticated users away from protected routes
- Logout from the app header

### 3. Properties dashboard (authenticated)

- List all properties in a table or card grid
- Show key fields at a glance (e.g. name, address, status, rent, bedrooms)
- Search and/or filter by status (available, rented, maintenance, etc.)
- Click a property to open its detail view

### 4. Property detail page (authenticated)

- Full property information on a single page
- Sections for core details, rental terms, and notes
- Actions: Edit, Delete (with confirmation)

### 5. Basic CRUD (authenticated)

| Action | Description |
|--------|-------------|
| **Create** | Form to add a new property |
| **Read** | List view + detail view |
| **Update** | Edit form pre-filled with existing data |
| **Delete** | Soft or hard delete with user confirmation |

---

## User Flow (Phase 1)

```
Landing Page
    │
    ├─► Login button ──► Login page ──► Properties list
    │                                          │
    │                                          ├─► Property detail
    │                                          │       ├─► Edit
    │                                          │       └─► Delete
    │                                          └─► Add new property
    │
    └─► (unauthenticated users cannot access dashboard routes)
```

---

## Tech Stack

### Frontend — `client/`

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16** (App Router) | React Server Components where appropriate |
| UI | **React 19** | Client components for forms and interactive UI |
| Styling | **Tailwind CSS 4** | Utility-first styling |
| Language | **TypeScript** | End-to-end type safety |
| Auth (client) | **Supabase Auth** (`@supabase/ssr`) | Session handling in middleware and client |
| API calls | **Fetch** → NestJS REST API | Server as the single API layer for property CRUD |

### Backend — `server/`

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **NestJS 11** | Modular structure (controllers, services, modules) |
| Language | **TypeScript** | Shared types with frontend where useful |
| Config | **@nestjs/config** | Environment variables |
| Database client | **@supabase/supabase-js** | Connected via `SupabaseModule` (already set up) |
| API style | **REST** | JSON endpoints under `/api` or resource-based routes |

### Database & Auth — Supabase

| Layer | Choice | Notes |
|-------|--------|-------|
| Database | **PostgreSQL** (Supabase) | Property and related tables |
| Auth | **Supabase Auth** | Internal staff accounts only |
| Security | **Row Level Security (RLS)** | Authenticated users only; policies per table |
| Storage (optional, later) | **Supabase Storage** | Property photos and documents |

### Dev & tooling

| Tool | Purpose |
|------|---------|
| ESLint | Linting (client + server) |
| Prettier | Code formatting (server) |
| Jest | Unit and e2e tests (server) |

---

## Suggested Project Structure

```
MIR Housing/
├── client/                    # Next.js frontend
│   ├── app/
│   │   ├── (main)/            # Public landing + layout
│   │   ├── (auth)/            # Login, callback routes
│   │   └── (dashboard)/       # Protected: properties CRUD
│   └── src/
│       ├── components/        # UI, layout, forms
│       ├── lib/               # Supabase client, API helpers
│       └── types/             # Property, API response types
│
├── server/                    # NestJS API
│   └── src/
│       ├── supabase/          # Supabase client module (done)
│       ├── properties/        # Property CRUD module (planned)
│       └── auth/              # Auth guard / JWT validation (planned)
│
└── purpose.md                 # This file
```

---

## Data Model (Phase 1 — draft)

A minimal `properties` table to support CRUD:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `name` | `text` | Property display name |
| `address` | `text` | Full address |
| `status` | `text` | e.g. `available`, `rented`, `maintenance` |
| `rent_amount` | `numeric` | Monthly rent |
| `bedrooms` | `integer` | Number of bedrooms |
| `bathrooms` | `numeric` | Number of bathrooms |
| `description` | `text` | Longer description / notes |
| `created_at` | `timestamptz` | Auto-set on create |
| `updated_at` | `timestamptz` | Auto-set on update |

Additional tables (tenants, leases, payments) are out of scope for Phase 1. See [docs/database-architecture.md](./docs/database-architecture.md) for the full schema, RLS policies, and migration SQL.

---

## Implementation Plan

### Step 1 — Foundation (partially done)

- [x] Next.js client scaffold with layout components
- [x] NestJS server scaffold
- [x] Supabase connection on server (`SupabaseModule`)
- [ ] Supabase client setup on frontend
- [ ] Environment variables documented (`.env.example` for client and server)
- [ ] CORS configured on NestJS for local dev

### Step 2 — Database & auth

- [ ] Create `properties` table in Supabase
- [ ] Enable RLS and policies (authenticated read/write for staff)
- [ ] Configure Supabase Auth (email login for internal users)
- [ ] NestJS auth guard: validate Supabase JWT on protected routes
- [ ] Next.js middleware: protect `/dashboard` routes

### Step 3 — Landing & login UI

- [ ] Design and build landing page (hero, brief description, Login CTA)
- [ ] Build login page and wire to Supabase Auth
- [ ] Post-login redirect to `/properties`
- [ ] Header: show Login vs Logout based on session

### Step 4 — Properties API (NestJS)

- [ ] `PropertiesModule` with controller and service
- [ ] `GET /properties` — list all
- [ ] `GET /properties/:id` — single property
- [ ] `POST /properties` — create
- [ ] `PATCH /properties/:id` — update
- [ ] `DELETE /properties/:id` — delete
- [ ] Input validation (e.g. `class-validator`)
- [ ] Consistent error responses

### Step 5 — Properties UI (Next.js)

- [ ] Properties list page (table/cards, loading and empty states)
- [ ] Property detail page
- [ ] Create property form
- [ ] Edit property form
- [ ] Delete confirmation dialog
- [ ] Toast or inline feedback on success/error

### Step 6 — Polish & verify

- [ ] Responsive layout (mobile-friendly tables/forms)
- [ ] Basic accessibility (labels, focus states, keyboard nav)
- [ ] Manual test checklist for full CRUD flow
- [ ] Deploy preview (optional): Vercel (client) + hosted API

---

## API Contract (draft)

Base URL: `http://localhost:8000/api/v1` (dev)

Environment variables: `API_PREFIX=api`, `API_VERSION=v1`

All protected endpoints require `Authorization: Bearer <supabase_access_token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/properties` | List properties |
| `GET` | `/api/v1/properties/:id` | Get one property |
| `POST` | `/api/v1/properties` | Create property |
| `PATCH` | `/api/v1/properties/:id` | Update property |
| `DELETE` | `/api/v1/properties/:id` | Delete property |

---

## Out of Scope (Phase 1)

- Public tenant portal or online rent payment
- Multi-company / multi-tenant SaaS
- Advanced reporting and analytics
- Document upload and image galleries (can be Phase 2)
- Role-based permissions beyond “authenticated staff”
- Mobile native apps

---

## Success Criteria (Phase 1)

1. Unauthenticated visitors see only the landing page and can reach login.
2. Authenticated staff see the properties list after login.
3. Staff can create, view, edit, and delete properties end-to-end.
4. Data persists in Supabase and is only accessible to logged-in users.
5. UI is usable on desktop and reasonably usable on mobile.

---

## Next Step

Start with **Step 2** (database schema + auth) and **Step 3** (landing + login UI) in parallel, then implement the properties API and dashboard UI.
