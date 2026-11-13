# Our Journey: staircase picture cards

Turn the Home page "Our Journey" cards into the picture-card style from your first screenshot, with photos you upload from admin.

## What you'll see on the website
- Each milestone card: photo on top, a coloured year band (orange, green, blue, repeating) with a small icon on the right, then the title and text below.
- Cards rise left to right like a staircase on desktop (one row of up to 6). On tablet they show in 2-3 columns, on phone one per row without the staircase.
- Card with no photo uploaded: shows only the year band, title and text (no broken image).
- Heading "Three decades of building..." stays the same and stays editable.

## What changes in admin (Home Page > Our Journey)
- Each milestone gets a **Photo** upload with a Remove photo button (same as Clientele/Subsidiaries).
- Optional **Icon** choice (flag, leaf, route, chart, globe, rocket) — defaults to a sensible one by position.
- Year, Title, Text, order and Live switch stay as now. Existing milestones are kept.

## For your server
- New migration `10_journey_images.sql` adds two optional columns (photo, icon) to the milestones table. Run it with psql, then rebuild and redeploy as usual.

## Technical details
- Migration: `ALTER TABLE home_journey_milestones ADD COLUMN IF NOT EXISTS image_url text, ADD COLUMN IF NOT EXISTS icon text`.
- `admin.home.journey.tsx`: add image + icon fields to HomeListEditor config.
- `home-top.functions.ts`: return image via `publishedFileUrl`; register table in public-files publication check so `/files/` serves it.
- `sections.tsx` `Journey()`: new card markup with tokens (primary/accent/secondary colors), staircase via per-index top margin on lg only.
