# Campaign Seeding Setup Complete ✓

## Summary

I've created 4 campaigns with different settings based on the CSV data provided. The system is ready to seed your database.

## Campaigns Created

### 1. **Two Lines for the Earth**
- **Slug:** `two-lines-earth`
- **Focus:** Climate change and environmental action
- **Accent Color:** #10b981 (Emerald Green)
- **Theme:** Light
- **Status:** Active
- **Settings:** AI Moderation enabled (moderate level), Email verification required

### 2. **She Can Do Anything**
- **Slug:** `she-can-do-anything`
- **Focus:** Women's empowerment and achievement
- **Accent Color:** #d946ef (Magenta)
- **Theme:** Light
- **Status:** Active
- **Settings:** AI Moderation enabled (moderate level), Email verification required

### 3. **2030 - The World We Imagine**
- **Slug:** `2030-world-imagine`
- **Focus:** Sustainable development goals (SDGs)
- **Accent Color:** #0ea5e9 (Sky Blue)
- **Theme:** Light
- **Status:** Active
- **Settings:** AI Moderation enabled (moderate level), Email verification required

### 4. **Madiba**
- **Slug:** `madiba`
- **Focus:** Nelson Mandela's legacy and peace
- **Accent Color:** #f59e0b (Amber)
- **Theme:** Light
- **Status:** Active
- **Settings:** AI Moderation enabled (moderate level), Email verification required

## How to Seed the Database

### Option 1: Via the Web UI (Recommended)
1. Start your dev server: `npm run dev` or `pnpm dev`
2. Navigate to: `http://localhost:3000/admin/seed`
3. The page will automatically trigger the seeding process
4. You'll see the result displayed on the page

### Option 2: Via API
```bash
curl -X POST http://localhost:3000/api/seed-campaigns
```

### Option 3: Manual SQL (if needed)
Run the generated SQL file:
```bash
node scripts/generate-seed-sql.js > seed.sql
psql "$POSTGRES_URL" < seed.sql
```

## Files Created

- `/app/api/seed-campaigns/route.ts` - API endpoint that performs the seeding
- `/app/admin/seed/page.tsx` - Web UI to trigger seeding
- `/scripts/seed-campaigns.ts` - TypeScript seed script
- `/scripts/seed-campaigns.js` - JavaScript seed script  
- `/scripts/generate-seed-sql.js` - SQL generator
- `/scripts/seed-with-supabase.mjs` - Supabase client seeder

## Database Operations

The seeding process:
1. **Deletes all existing campaigns** and their related data (cascading deletes)
2. **Inserts 4 new campaigns** with the configurations above
3. **Creates default moderation settings** for each campaign (moderate level, profanity filter enabled)

## CSV Data Integration

The CSV file provided contained poems organized by campaign title:
- **Two Lines for the Earth**: 5 poems (climate theme)
- **She Can Do Anything**: 7 poems (women empowerment theme)
- **2030 - The World We Imagine**: 8 poems (SDG theme)
- **Madiba**: 10 poems (Nelson Mandela tribute theme)

These campaign definitions are now seeded with the themes and metadata from the CSV file.

## Next Steps

1. **Start the dev server** to activate the preview
2. **Visit `/admin/seed`** to trigger the database seeding
3. **Verify campaigns** appear in your dashboard
4. The campaigns are now ready for contributions!

---

**Status:** Ready to seed ✓
**Database:** Supabase/Aurora PostgreSQL
**Environment Variables:** Auto-loaded from project settings
