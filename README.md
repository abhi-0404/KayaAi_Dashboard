# Kaya AI — Construction Command Center

A real-time construction site management dashboard that turns Meta Smart Glasses into a live command center. Stream first-person video, detect hazards in 1.2 s, approve blueprints, and read AI-generated site reports — all from one operational surface.

---

## Features

### Live Site Intelligence
- **Real-time worker monitoring** — roster with battery level, AI session state, hazard status, zone location and last-active timestamp
- **Live AI sessions** — first-person glass streams with AI overlay, voice transcript, confidence score and session timer
- **Hazard detection** — computer vision flags missing PPE, fall risk and exclusion-zone breaches; alerts surface in under 1.2 s

### Command Center Dashboard
- **KPI cards** — workers on site, live AI sessions, open hazards, total captures; all from real Supabase rows
- **Activity feed** — last 12 site events with severity colouring (session starts, hazards, inspections, blueprint comparisons)
- **Zone occupancy** — live worker count per zone, colour-coded by status
- **AI health metrics** — captures analysed, devices online, events resolved — percentages derived from real data, never invented

### Project Management
- **Projects overview** — progress, worker count, open hazards, blueprint status and AI session count per project
- **Project detail** — workers on site, filtered issues, blueprints and tasks for a single project
- **Tasks tracker** — priority, assignee, due date, progress bar, status transitions backed by Supabase

### Issues & Safety
- **Kanban board** — three-column triage (Open / In Progress / Resolved) with Supabase status updates
- **Priority system** — Critical / High / Medium / Low with colour-coded severity badges
- **Worker attribution** — every issue traces back to the worker or AI session that raised it

### Blueprints
- **Version-controlled library** — drawing sets with AI indexing status, sheet count, uploader and file size
- **Admin approval queue** — approve or request changes; pending count shown as a live badge in the nav

### AI Reports
- Daily, weekly, inspection and compliance reports generated from real session data
- Confidence scores and page counts per report

### User & Access Management
- **Role-based access control** — Admin and Supervisor roles with least-privilege defaults
- **Admin user management** — invite, assign roles, suspend users
- **Pending approval queue** — new sign-ups wait for admin approval before accessing the dashboard
- **Audit trail** — all approval actions are logged

### Navigation
- Responsive sticky top nav with pill rail, overflow menu and mobile sheet
- Search (xl+), project selector (2xl+), notification bell with live pending-approval count
- Role switcher in user menu (Admin can view as Supervisor)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, SSR) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives) |
| Backend / DB | [Supabase](https://supabase.com) (Postgres, Auth, Realtime) |
| State | Supabase Realtime → `useSyncExternalStore` (no Redux/Zustand) |
| Server | Nitro (via TanStack Start) |
| Package manager | Bun |
| Build tool | Vite 8 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── assets/               # Static image assets
├── components/
│   ├── ui/               # 44 shadcn/ui primitives
│   ├── auth-context.tsx  # AuthProvider — session, profile, signOut
│   ├── auth-panel.tsx    # Sign-in / sign-up form (Google OAuth + email)
│   ├── role-context.tsx  # RoleProvider — Admin/Supervisor toggle
│   ├── top-nav.tsx       # Responsive sticky navigation bar
│   ├── worker-drawer.tsx # Slide-out worker detail panel
│   └── new-project-dialog.tsx
├── hooks/
│   └── use-mobile.tsx    # Responsive breakpoint hook
├── integrations/
│   └── supabase/         # Client, server client, auth middleware, types
├── lib/
│   ├── live-store.ts     # useLiveData() — Realtime store across 8 tables
│   ├── mock-data.ts      # TypeScript type definitions + seed shapes
│   ├── dev-auth.ts       # Local-only auth bypass (never ships to prod)
│   └── utils.ts          # cn() and shared helpers
├── routes/
│   ├── __root.tsx        # Root layout, error boundary, 404
│   ├── index.tsx         # Landing page
│   ├── reset-password.tsx
│   └── _authenticated/
│       ├── route.tsx           # Auth guard + layout
│       ├── dashboard.tsx       # Live command center overview
│       ├── workers.tsx         # Worker roster
│       ├── monitoring.tsx      # Live glass feeds
│       ├── issues.tsx          # Kanban triage board
│       ├── tasks.tsx           # Task tracker
│       ├── blueprints.tsx      # Blueprint library
│       ├── blueprint-approval.tsx  # Admin approval queue
│       ├── projects.index.tsx  # Projects grid
│       ├── projects.$projectId.tsx # Project detail
│       ├── reports.tsx         # AI reports
│       ├── users.tsx           # User management
│       └── settings.tsx        # Profile & preferences
├── server.ts             # Nitro server entry (SSR error wrapper)
├── start.ts              # TanStack Start — CSRF + Supabase middleware
└── styles.css            # Tailwind v4 base + CSS custom properties
supabase/
├── config.toml           # Local Supabase dev config
└── migrations/           # 4 SQL migrations (tables + RLS policies)
scripts/
└── verify-site-admin.mjs # CLI helper to grant site-admin role
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org) or [Bun](https://bun.sh)
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```sh
git clone https://github.com/abhi-0404/KayaAi_Dashboard.git
cd KayaAi_Dashboard
```

### 2. Install dependencies

```sh
bun install
# or
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```sh
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run database migrations

```sh
npx supabase db push
# or apply each file in supabase/migrations/ manually via the Supabase dashboard
```

### 5. Start the development server

```sh
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL (client-side) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/publishable key (client-side) |
| `SUPABASE_URL` | ✅ | Supabase project URL (server-side) |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon key (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — server only, never expose to client |
| `VITE_DEV_AUTH_BYPASS` | ⬜ | Set to `true` in `.env.local` to skip auth on localhost |

---

## Database Schema

The Supabase schema is managed via migrations in `supabase/migrations/`. Key tables:

| Table | Purpose |
|---|---|
| `profiles` | User profiles linked to `auth.users` |
| `worker_status` | Real-time presence — zone, task, AI session, hazard |
| `devices` | Meta Smart Glasses registry — battery, connection state |
| `site_events` | Hazards, PPE violations, inspections, observations |
| `zones` | Named zones per project level |
| `levels` | Floor/level definitions per project |
| `projects` | Project registry with progress and status |
| `blueprints` | Drawing sets with AI indexing and approval state |
| `media_assets` | Captures from glasses with AI analysis results |
| `tasks` | Task assignments with status and progress |

All tables have Row Level Security (RLS) policies. Admins can read/write everything; Supervisors are scoped to their projects.

---

## Scripts

```sh
bun run dev          # Start development server
bun run build        # Production build
bun run preview      # Preview production build locally
bun run lint         # ESLint
bun run format       # Prettier
node scripts/verify-site-admin.mjs   # Grant/verify site-admin role
```

---

## Auth Flow

1. User signs up with email/password or Google OAuth
2. Account lands in a **pending approval** state
3. An Admin reviews the queue at `/users` and approves or rejects
4. Approved users are assigned a role (Admin or Supervisor) and gain full access
5. Role can be changed any time by an Admin from the user management page

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and open a pull request against `main`

---

## License

MIT — see [LICENSE](LICENSE) for details.
