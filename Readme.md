# MIR Housing

**An internal property management system for MIR Housing staff.**

MIR Housing is a private web application — not a public rental marketplace. It helps your team keep company-owned rental properties, rooms, photos, furnishings, utility bills, and contacts in one secure place.

---

## For everyone (non-technical overview)

### What is this app?

Think of MIR Housing as a **digital filing cabinet** for your rental properties. Instead of spreadsheets, chat messages, and scattered photos, staff can:

- **Sign in** with a company email and password
- **Browse** properties in a searchable, filterable dashboard (card or list view)
- **Filter by room** (status, rent range) so mixed buildings still show matching units
- **Create / edit** property listings with multiple rooms and photos (per property or per room)
- **Open any property** for full details: description, location, gallery, bills, furnishings, rooms
- **View photos** in a gallery with full-screen lightbox (download where allowed)
- **Copy room info** for sharing (role-dependent)
- **Open Zalo / landlord contacts** (managers only — not visible to collaborators)
- **Use HCMC location picks** (district → ward → street), including Gò Vấp and Quận 7
- **Switch language** between English (EN) and Vietnamese (VN)
- **Manage your profile** (account details, quick links) from the sidebar or header
- **Change password** and (for managers) **manage team accounts** under Settings
- **Deactivate or delete accounts** according to role level

Only people with a login can see property data. Nothing is shown to the public without signing in.

### Who is it for?

| Audience | How they use it |
|----------|-----------------|
| **Sales partners (contributors)** | Browse, copy, and download listing info — view only |
| **Sales staff** | Full property create/edit/delete; create/deactivate contributors |
| **Administrators** | Full property access; manage sale + contributor accounts |
| **Super administrators** | Full access; create/deactivate/delete admins |
| **Developers / IT** | Install, configure, deploy, and maintain the system (see [For developers](#for-developers) below) |

### Typical day-to-day flow

1. Open the website in your browser
2. Click **Login** and enter your company credentials
3. You land on the **Properties** page — search, filter, and paginate results
4. Use the **sidebar** for Properties, Settings, and Profile (collapse control sits next to the Menu title)
5. Optionally switch **EN / VN** in the header
6. Click **Create New** to add a property (with rooms), or open an existing one
7. On the detail page, review description, location, gallery, utility bills, furnishings, and rooms
8. Click **Edit** to update a property (if your role allows), or go to **Settings** / **Profile** as needed
9. Click **Logout** in the header when you are done

### Languages

| Code | Language |
|------|----------|
| **EN** | English |
| **VN** | Vietnamese (Tiếng Việt) |

Your language choice is saved in the browser and applied across the app (navigation, forms, property details, settings, and more).

### Property / room statuses

| Status (EN) | Status (VN) | Meaning |
|-------------|-------------|---------|
| **Available** | Còn trống | Ready to rent |
| **Rented** | Đã thuê | Currently occupied |
| **Maintenance** | Bảo trì | Under repair or not ready for tenants |
| **Inactive** | Ngưng hoạt động | Not in active use |

### User roles (4 levels)

| Level | Role | Capabilities |
|-------|------|----------------|
| **1** | **super_admin** | Full property access; create / deactivate / delete **admin** accounts |
| **2** | **admin** | Full property access; create / deactivate **sale** and **contributor** accounts |
| **3** | **sale** | Full property access (including delete); create / deactivate **contributor** accounts; see Zalo / contacts |
| **4** | **contributor** | View, copy, and download only — **no** create/edit/delete, **no** Zalo / landlord contacts, **no** account management |

Inactive (deactivated) users cannot sign in.

### Session security

Access tokens from login are valid for about **1 hour** (Supabase default JWT expiry). When the token expires, the app **logs you out automatically** and sends you back to the login page.

---

## For developers

### Tech stack

| Part | Technology |
|------|------------|
| **Website (frontend)** | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| **API (backend)** | NestJS 11, TypeScript |
| **Database & auth** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) |
| **i18n** | Custom React context + EN/VN dictionaries in `client/src/i18n/` |
| **API testing** | [Bruno](https://www.usebruno.com/) collection in `bruno/` |

### Project structure

```
MIR Housing/
├── client/                 # Next.js web app
│   ├── app/                # App Router pages (properties, settings, profile, …)
│   └── src/
│       ├── components/     # UI components (layout, auth, properties, …)
│       ├── i18n/           # EN/VN dictionaries + LanguageProvider
│       ├── lib/            # API client, auth, roles, HCMC locations
│       └── types/          # Shared TypeScript types
├── server/                 # NestJS REST API
│   └── supabase/
│       ├── migrations/     # SQL to set up the database (run in order)
│       └── seed/           # Optional sample data
├── bruno/                  # API request collection for manual testing
└── docs/                   # Planning and technical notes
```

### Prerequisites

- **Node.js** 20 or newer ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- A **Supabase** project (free tier is fine for development)

### 1. Clone the repository

```bash
git clone <your-github-repo-url>
cd "MIR Housing"
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run each migration **in order** from `server/supabase/migrations/` (numeric prefix order). Important recent ones include:
   - `012_property_hcmc_location.sql` — district / ward / street fields
   - `013`–`014` — `sale` / `contributor` roles
   - `016_property_zalo_group_link.sql` — Zalo group link
   - `021`–`024` — multi-room model and related cleanups
   - `025_super_admin_and_profile_active.sql` — `super_admin` role + `profiles.is_active`
3. (Optional) Run seed scripts in `server/supabase/seed/` for sample data
4. Create at least one user under **Authentication → Users**
5. In `public.profiles`, set that user’s `role` to `super_admin` (or `admin`) as needed
6. Copy keys from **Project Settings → API** (URL, anon key, service role key)

> After pulling role changes, always re-run any new migrations and **restart the Nest API** so new routes (e.g. `GET /auth/users`) are registered.

### 3. Configure environment variables

**Server** — create `server/src/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URL=http://localhost:3000
API_PREFIX=api
API_VERSION=v1
PORT=8000
```

`SUPABASE_SERVICE_ROLE_KEY` is required for property creation with images, image uploads, and user management APIs.

**Client** — create `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

> **Important:** Never commit real `.env` files to GitHub. They are listed in `.gitignore`.

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 5. Run locally

Open **two terminal windows**:

**Terminal 1 — API (port 8000):**

```bash
cd server
npm run start:dev
```

**Terminal 2 — Website (port 3000):**

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- API base URL: `http://localhost:8000/api/v1`
- Health check: `GET http://localhost:8000/api/v1`

Prefer `start:dev` locally so route changes reload automatically. Plain `npm run start` only compiles once.

### 6. Test the API with Bruno

1. Install [Bruno](https://www.usebruno.com/)
2. Open the collection at `bruno/MIR Housing/`
3. Select the **local** environment
4. Set `email`, `password`, and `newPassword` in `bruno/MIR Housing/environments/local.bru`
5. Run **Auth → Login** first, then other requests

### Main API endpoints

| Method | Endpoint | Auth / role | Description |
|--------|----------|-------------|-------------|
| `POST` | `/auth/login` | No | Sign in (blocked if profile is inactive) |
| `POST` | `/auth/logout` | Yes | Sign out |
| `GET` | `/auth/me` | Yes | Current user profile |
| `GET` | `/auth/users` | Manager roles | List managed users |
| `POST` | `/auth/users` | Manager roles | Create a user (role limited by actor) |
| `PATCH` | `/auth/users/:id/active` | Manager roles | Activate / deactivate a user |
| `DELETE` | `/auth/users/:id` | Super admin | Delete an admin account |
| `POST` | `/auth/change-password` | Yes | Change password |
| `GET` | `/properties` | Yes | List properties (paginated, filterable) |
| `GET` | `/properties/:id` | Yes | Single property with rooms, images, bills, furnishings |
| `POST` | `/properties` | Managers | Create property (incl. rooms / images) |
| `PATCH` | `/properties/:id` | Managers | Update property |
| `DELETE` | `/properties/:id` | Managers | Soft-delete property |
| `GET` / `POST` | `/properties/:id/images` | Yes / Managers | List or upload property images |
| `POST` | `/properties/:id/rooms/:roomId/images` | Managers | Upload room images |
| `GET` / `POST` / `PATCH` / `DELETE` | `/properties/:id/utility-bills…` | Yes / Managers | Utility bill CRUD |

All authenticated routes require `Authorization: Bearer <access_token>` from login.

Zalo / landlord contact fields are **redacted in API responses** for contributors.

### Frontend notes

- **Roles helpers:** `client/src/lib/roles.ts`
- **HCMC locations (static):** `client/src/lib/hcmc-locations.ts`
- **i18n dictionaries:** `client/src/i18n/dictionaries/en.ts` and `vn.ts`
- **Provider:** `LanguageProvider` (via `client/src/components/Providers.tsx`)
- **Locale preference key:** `mir_housing_locale` (`en` or `vn`) in `localStorage`
- **Sidebar collapse key:** `mir_housing_sidebar_collapsed`
- To add a new string: add the key to **both** dictionaries, then use `t('your.key')` via `useTranslations()`

### Production build

```bash
# API
cd server
npm run build
npm run start:prod

# Website
cd client
npm run build
npm run start
```

> **Note:** `start:prod` runs `node dist/src/main` (Nest outputs to `dist/src/`, not `dist/main`).

---

## Deploying the API to Render

1. Push your code to GitHub
2. On [Render](https://render.com) → **New +** → **Web Service** → connect your repo
3. Use these settings:

| Setting | Value |
|--------|--------|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Node version** | `20` (set env var `NODE_VERSION=20`) |

4. Add environment variables in Render:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CLIENT_URL` | Your production frontend URL (for CORS), e.g. `https://mir-housing.vercel.app` |
| `API_PREFIX` | `api` |
| `API_VERSION` | `v1` |

Do **not** set `PORT` — Render provides it automatically.

5. After deploy, your API will be at e.g. `https://your-service.onrender.com/api/v1`

### Common Render issues

| Problem | Fix |
|--------|-----|
| `Cannot find module dist/main` | Ensure `start:prod` runs `node dist/src/main` (already set in `package.json`) |
| Build succeeds but app won't start | Check Render logs; confirm all env vars are set |
| CORS errors | Set `CLIENT_URL` to your exact frontend URL (no trailing slash) |
| Image upload fails | Add `SUPABASE_SERVICE_ROLE_KEY` |
| `GET /auth/users` returns 404 | Redeploy/restart API after pulling user-management routes; run migration `025` |

---

## Deploying the client (Vercel)

1. Deploy the `client/` folder to [Vercel](https://vercel.com)
2. In **Settings → Environment Variables**, set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com/api/v1
```

3. **Redeploy** after adding or changing `NEXT_PUBLIC_*` variables (they are baked in at build time)

### Common Vercel issues

| Problem | Fix |
|--------|-----|
| `Cannot reach the server… port 8000` | `NEXT_PUBLIC_API_BASE_URL` is missing or still pointing at localhost — set the Render URL and redeploy |
| CORS blocked | On Render, set `CLIENT_URL` to your Vercel URL |
| TypeScript build fails on `UpdatePropertyPayload` | Ensure client is on the latest code that allows `null` on update fields |

---

## Pushing to GitHub

1. Create a private repository on GitHub
2. Confirm secrets are not tracked:

   ```bash
   git status
   ```

   You should **not** see `server/src/.env`, `client/.env.local`, or `node_modules/`.

3. Commit and push:

   ```bash
   git add .
   git commit -m "Your commit message"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

## Documentation

- [`docs/purpose.md`](docs/purpose.md) — product goals, phase 1 scope, and implementation plan
- [`docs/database-architecture.md`](docs/database-architecture.md) — database notes

---

## License

Private / internal use. All rights reserved unless your organization specifies otherwise.
