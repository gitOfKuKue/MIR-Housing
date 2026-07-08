# MIR Housing

**An internal property management system for MIR Housing staff.**

MIR Housing is a private web application — not a public rental marketplace. It helps your team keep all company-owned rental properties, photos, room details, and utility bills in one secure place.

---

## For everyone (non-technical overview)

### What is this app?

Think of MIR Housing as a **digital filing cabinet** for your rental properties. Instead of spreadsheets, chat messages, and scattered photos, staff can:

- **Sign in** with a company email and password
- **Browse** all properties in one dashboard
- **Open any property** to see full details on a single page
- **View photos** in a gallery
- **Check utility bills** (electricity, water, Wi‑Fi, management fees, and more)
- **See room and building info** — bedrooms, bathrooms, parking, deposit terms, and similar details

Only people with a login can see property data. Nothing is shown to the public without signing in.

### Who is it for?

| Audience | How they use it |
|----------|-----------------|
| **Office / operations staff** | Look up properties, rent, status, and notes during daily work |
| **Managers** | Review the portfolio at a glance and confirm details before decisions |
| **Developers / IT** | Install, configure, and maintain the system (see [For developers](#for-developers) below) |

### Typical day-to-day flow

1. Open the website in your browser
2. Click **Login** and enter your company credentials
3. You land on the **Properties** page — a grid of property cards
4. Click **View details** on any property
5. On the detail page you can read the description, location, photo gallery, utility bills table, and room information
6. Click **Logout** in the header when you are done

### Property statuses (what the labels mean)

| Status | Meaning |
|--------|---------|
| **Available** | Ready to rent |
| **Rented** | Currently occupied |
| **Maintenance** | Under repair or not ready for tenants |
| **Inactive** | Not in active use (archived from day-to-day operations) |

### What’s included today

- Secure login and logout
- Property list and detail pages
- Property photos (uploaded via the API; displayed in the app)
- Utility bill records per property
- Room and amenity fields (bedrooms, toilet type, parking, deposits, etc.)

Planned improvements (not all built yet) include a public landing page, and in-app forms to add or edit properties directly from the browser. See [`docs/purpose.md`](docs/purpose.md) for the full roadmap.

---

## For developers

### Tech stack

| Part | Technology |
|------|------------|
| **Website (frontend)** | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| **API (backend)** | NestJS 11, TypeScript |
| **Database & auth** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) |
| **API testing** | [Bruno](https://www.usebruno.com/) collection in `bruno/` |

### Project structure

```
MIR Housing/
├── client/          # Next.js web app (what staff see in the browser)
├── server/          # NestJS REST API
│   └── supabase/
│       ├── migrations/   # SQL to set up the database (run in order)
│       └── seed/         # Optional sample data
├── bruno/           # API request collection for manual testing
└── docs/            # Planning and technical notes
```

### Prerequisites

Install these on your machine before setting up locally:

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
2. In the Supabase dashboard, open **SQL Editor**
3. Run each migration file **in order** from `server/supabase/migrations/`:
   - `001_phase1.sql`
   - `002_fix_properties_rls.sql`
   - `003_soft_delete_rpc.sql`
   - `004_admin_only_delete.sql`
   - `005_property_images.sql`
   - `006_property_utility_bills.sql`
   - `008_property_room_info.sql`
4. (Optional) Run seed scripts in `server/supabase/seed/` for sample data
5. Create at least one user under **Authentication → Users** (email + password)
6. Copy your **Project URL** and **anon public key** from **Project Settings → API**

### 3. Configure environment variables

**Server** — create `server/src/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CLIENT_URL=http://localhost:3000
API_PREFIX=api
API_VERSION=v1
PORT=8000
```

**Client** — create `client/.env.local` (optional; defaults work for local dev):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

> **Important:** Never commit real `.env` files to GitHub. They are already listed in `.gitignore`.

### 4. Install dependencies

```bash
# API
cd server
npm install

# Website
cd ../client
npm install
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

Then open [http://localhost:3000](http://localhost:3000) in your browser.

- API base URL: `http://localhost:8000/api/v1`
- Health check: `GET http://localhost:8000/api/v1` (or your configured prefix)

### 6. Test the API with Bruno

1. Install [Bruno](https://www.usebruno.com/)
2. Open the collection at `bruno/MIR Housing/`
3. Select the **local** environment
4. Run **Auth → Login** first, then other property requests

Environment variables in `bruno/MIR Housing/environments/local.bru` include `baseUrl`, `email`, `password`, and IDs saved after create requests.

### Main API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/logout` | Sign out |
| `GET` | `/auth/me` | Current user profile |
| `GET` | `/properties` | List properties (paginated, filterable) |
| `GET` | `/properties/:id` | Single property with images and utility bills |
| `POST` | `/properties` | Create property |
| `PATCH` | `/properties/:id` | Update property |
| `DELETE` | `/properties/:id` | Delete property |
| `POST` | `/properties/:id/images` | Upload images (JPG, PNG, WebP) |
| `GET` | `/properties/:id/utility-bills` | List utility bills |
| `POST` | `/properties/:id/utility-bills` | Add utility bill |

All property routes require a valid `Authorization: Bearer <access_token>` header from login.

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

Deploy the client and server to your hosting provider of choice (e.g. Vercel for the client, Railway/Fly/Render for the API). Point environment variables to your production Supabase project and URLs.

### Pushing to GitHub

1. Create a new repository on GitHub (private recommended — this is internal tooling)
2. Ensure secrets are not tracked:

   ```bash
   git status
   ```

   You should **not** see `server/src/.env`, `client/.env.local`, or `node_modules/`.

3. Commit and push:

   ```bash
   git add .
   git commit -m "Initial commit: MIR Housing property management app"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

## Documentation

- [`docs/purpose.md`](docs/purpose.md) — product goals, phase 1 scope, and implementation plan

---

## License

Private / internal use. All rights reserved unless your organization specifies otherwise.
