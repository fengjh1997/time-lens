# Time Lens

Time Lens is a day/week-first planning PWA focused on energy, rhythm, and reflection rather than simple task lists.

Current version: `v6.8.0`

## What It Is

Time Lens treats each time block as a small record of focus quality.
The product centers around two primary canvases:

- `Day View`: a detailed vertical timeline for single-day review and edits
- `Week View`: a wide weekly planning board for structure, momentum, and comparison

Monthly and yearly context still exist, but they now support the week/day flow instead of competing with it.

## Core Product Principles

- Day/week views are the main entry points
- Panorama data should be embedded into operational screens where possible
- Offline-first interaction comes before cloud sync
- Cloud sync must reduce overwrite conflicts, not create them
- Mobile interaction quality is a first-class requirement

## Key Features

- Day timeline with energy scoring, tags, notes, and bonus blocks
- Week planning grid with direct scanning across seven days
- Long-press charging for fast scoring
- Dedicated drag handle for moving time blocks without gesture conflict
- Optional notes, optional tags, and manual detail editing on tap
- Theme color system with synced preferences
- Offline-first local persistence with optional Supabase sync

## UX Direction In v6.8.0

- Removed the need for a persistent sidebar concept
- Reframed the app around a unified top-level navigation dock
- Embedded month/year summaries into day/week pages
- Simplified the visual hierarchy so labels are stronger than reflection text
- Replaced charging text with icon-based feedback
- Separated tap, long-press, and drag into distinct interactions

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Zustand`
- `Framer Motion`
- `Supabase`
- `next-pwa`

## Local Development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Lint: `npm run lint`
4. Type-check: `npx tsc --noEmit`

## Cloud Sync Notes

Time Lens uses an offline-first model.
Local state remains the source of immediate interaction, and cloud sync is layered on top.

For full settings and tag-color sync, update the Supabase `settings` table with these fields:

- `show_details_in_week_view`
- `daily_energy_goal`
- `weekly_energy_goal`
- `tags_json`

See [supabase_schema.sql](/G:/vibe-coding/time-lens/supabase_schema.sql).

## Release Notes

Latest release highlights are tracked in [CHANGELOG.md](/G:/vibe-coding/time-lens/CHANGELOG.md).
