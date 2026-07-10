# MIR Housing

**An internal property management system for MIR Housing staff.**

MIR Housing is a private web application — not a public rental marketplace. It helps your team keep company-owned rental properties, photos, room details, furnishings, and utility bills in one secure place.

---

## For everyone (non-technical overview)

### What is this app?

Think of MIR Housing as a **digital filing cabinet** for your rental properties. Instead of spreadsheets, chat messages, and scattered photos, staff can:

- **Sign in** with a company email and password
- **Browse** all properties in a searchable, filterable dashboard (card or list view)
- **Create** new property listings with photos
- **Edit** any property details from the browser
- **Open any property** to see full details on a single page
- **View photos** in a gallery with full-screen lightbox
- **Check utility bills** (electricity, water, Wi‑Fi, management fees, and more)
- **See room, furnishing, and building info** — bedrooms, parking, deposits, and similar details
- **Switch language** between English (EN) and Vietnamese (VN)
- **Change password** from the Settings page
- **Delete properties** (admins only)

Only people with a login can see property data. Nothing is shown to the public without signing in.

### Who is it for?

| Audience | How they use it |
|----------|-----------------|
| **Office / operations staff** | Look up, create, and update properties during daily work |
| **Managers / admins** | Review the portfolio, manage listings, and delete properties |
| **Developers / IT** | Install, configure, deploy, and maintain the system (see [For developers](#for-developers) below) |

### Typical day-to-day flow

1. Open the website in your browser
2. Click **Login** and enter your company credentials
3. You land on the **Properties** page — search, filter, and paginate results
4. Optionally switch **EN / VN** in the header (or under **Settings → Language**)
5. Click **Create New** to add a property, or open an existing one
6. On the detail page, review description, location, gallery, utility bills, furnishings, and room info
7. Click **Edit** to update a property, or go to **Settings** to change your password
8. Click **Logout** in the header when you are done

### Languages

| Code | Language |
|------|----------|
| **EN** | English |
| **VN** | Vietnamese (Tiếng Việt) |

Your language choice is saved in the browser and applied across the app (navigation, forms, property details, settings, and more).

### Property statuses

| Status (EN) | Status (VN) | Meaning |
|-------------|-------------|---------|
| **Available** | Còn trống | Ready to rent |
| **Rented** | Đã thuê | Currently occupied |
| **Maintenance** | Bảo trì | Under repair or not ready for tenants |
| **Inactive** | Ngưng hoạt động | Not in active use |

### User roles

| Role | Capabilities |
|------|----------------|
| **staff** | View, create, and edit properties |
| **admin** | Everything staff can do, plus delete properties |

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
│   └── src/
│       ├── components/     # UI components
│       ├── i18n/           # EN/VN dictionaries + LanguageProvider
│       ├── lib/            # API client + auth helpers
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
2. Open **SQL Editor** and run each migration **in order** from `server/supabase/migrations/`:
   - `001_phase1.sql`
   - `002_fix_properties_rls.sql`
   - `003_soft_delete_rpc.sql`
   - `004_admin_only_delete.sql`
   - `005_property_images.sql`
   - `006_property_utility_bills.sql`
   - `008_property_room_info.sql`
   - `009_rename_utility_bill_status.sql`
   - `010_property_furnishings.sql`
   - `011_fix_storage_rls.sql` *(run if image upload fails with RLS errors)*
3. (Optional) Run seed scripts in `server/supabase/seed/` for sample data
4. Create at least one user under **Authentication → Users**
5. Set the user's role to `admin` in `public.profiles` if they need delete access
6. Copy keys from **Project Settings → API** (URL, anon key, service role key)

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

`SUPABASE_SERVICE_ROLE_KEY` is required for property creation with images and for image uploads on the API.

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

### 6. Test the API with Bruno

1. Install [Bruno](https://www.usebruno.com/)
2. Open the collection at `bruno/MIR Housing/`
3. Select the **local** environment
4. Set `email`, `password`, and `newPassword` in `bruno/MIR Housing/environments/local.bru`
5. Run **Auth → Login** first, then other requests

### Main API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | No | Sign in |
| `POST` | `/auth/logout` | Yes | Sign out |
| `GET` | `/auth/me` | Yes | Current user profile |
| `POST` | `/auth/change-password` | Yes | Change password |
| `GET` | `/properties` | Yes | List properties (paginated, filterable) |
| `GET` | `/properties/:id` | Yes | Single property with images, bills, furnishings |
| `POST` | `/properties` | Yes | Create property |
| `PATCH` | `/properties/:id` | Yes | Update property |
| `DELETE` | `/properties/:id` | Admin | Soft-delete property |
| `GET` | `/properties/:id/images` | Yes | List property images |
| `POST` | `/properties/:id/images` | Yes | Upload images (JPG, PNG, WebP) |
| `GET` | `/properties/:id/utility-bills` | Yes | List utility bills |
| `POST` | `/properties/:id/utility-bills` | Yes | Add utility bill |
| `PATCH` | `/properties/:id/utility-bills/:billId` | Yes | Update utility bill |
| `DELETE` | `/properties/:id/utility-bills/:billId` | Yes | Delete utility bill |

All authenticated routes require `Authorization: Bearer <access_token>` from login.

### Frontend i18n notes

- Dictionaries: `client/src/i18n/dictionaries/en.ts` and `vn.ts`
- Provider: `LanguageProvider` (wrapped in `client/src/components/Providers.tsx`)
- Switcher: header + Settings page
- Preference key in `localStorage`: `mir_housing_locale` (`en` or `vn`)
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

---

## License

Private / internal use. All rights reserved unless your organization specifies otherwise.
