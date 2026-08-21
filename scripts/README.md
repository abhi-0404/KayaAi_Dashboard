# Database Seeder

This directory contains scripts to populate your Supabase database with realistic test data.

## seed-database.mjs

Populates all tables with test data including:
- **5 Projects** - Construction projects with different phases
- **Workers** - 15 workers with profiles, devices, and real-time status
- **AI Glasses/Devices** - Paired devices with battery, connection status
- **Site Events** - 20-30 hazards, PPE violations, and observations
- **Tasks** - 15-20 tasks with various statuses
- **Blueprints** - 10-15 architectural drawings with approval status
- **AI Reports** - 5-8 generated reports
- **Media Assets** - 20-30 photo/video captures with AI analysis
- **Zones & Levels** - Work zones and building levels

## How to Run

### Prerequisites

Make sure your `.env.local` file has these variables set:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run the Seeder

```bash
npm run seed
```

### What It Does

1. **Clears existing test data** (keeps your auth users safe)
2. **Seeds tables in order** (respects foreign key relationships)
3. **Creates realistic data**:
   - Active, idle, and offline workers
   - Live AI sessions with realistic battery levels
   - Open hazards and safety events
   - In-progress and completed tasks
   - Pending and approved blueprints

### After Seeding

1. Refresh your dashboard - you should see:
   - Workers with live sessions
   - Active hazards flagged
   - Projects with progress
   - Real-time activity feed
   
2. **The data updates in real-time** thanks to Supabase Realtime subscriptions

### Re-seeding

You can run `npm run seed` multiple times. It will:
- Clear previous test data
- Generate fresh random data
- Maintain different values each time

## Troubleshooting

### "Missing environment variables"

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`. This is different from the anon/public key.

### "Foreign key constraint violation"

The seeder handles dependencies automatically. If you see this error, some tables might have existing data that references missing records. Run the seeder again to clear and re-populate.

### "Permission denied"

Make sure you're using the **service role key** (not the anon key) which has admin privileges.

## Customization

Edit `seed-database.mjs` to:
- Change number of workers: Modify `workerNames` array
- Add more projects: Add to `projectNames` array  
- Adjust event counts: Change `randomInt(20, 30)` ranges
- Modify hazard types: Edit `hazardTypes` array
