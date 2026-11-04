# Make the top of the home page editable

Right now these four home-page blocks are fixed in the website code (not editable in admin):

1. **Hero slideshow** — 5 photos, each with project name, headline and sub-text
2. **Key figures strip** — 30+ Years, 500+ Projects, 1,000+ Employees, PAN India, ₹13,000 Cr
3. **Who we are** — heading, 5 paragraphs (Read more), 3 small highlights, 3 photos
4. **Our Journey** — heading and milestone cards (year, title, text)

## What admins will get

A new **Home Page** menu in the admin panel (placed right after Dashboard) with four screens:

- **Hero Slides** — add / edit / reorder / hide / delete slides; photo required; project name, headline, sub-text, photo description.
- **Key Figures** — add / edit / reorder / hide / delete figure cards (value + label).
- **Who We Are** — edit heading and paragraphs (first one shows before "Read more"), the 3 highlights (title + short text), and replace the main photo and 2 side photos.
- **Our Journey** — edit heading; add / edit / reorder / hide / delete milestones.

All current text and photos are copied in first, so the website looks exactly the same until someone edits it. Changes appear on the live site immediately, no republish needed. The menu items are marked completed (not "Soon").

## Technical details

- Tables: `home_hero_slides`, `home_stats`, `home_about` (single row: eyebrow, heading, paragraphs jsonb, highlights jsonb, images jsonb), `home_journey_settings` + `home_journey_milestones`. RLS: public read of visible rows, staff write via `is_staff`. Migration seeds current content.
- Images uploaded to existing private bucket as `storage:<path>`, resolved to signed URLs in the public read server function (same pattern as Landmark Projects); seeded rows reference existing bundled asset URLs.
- `src/lib/home-top.functions.ts` (public read + admin CRUD), `homeTopQuery` used by `Hero`, `StatsBand`, `About`, `Journey` in `sections.tsx` with current constants as fallback.
- Admin routes `admin.home.hero.tsx`, `admin.home.stats.tsx`, `admin.home.about.tsx`, `admin.home.journey.tsx`; register in `src/lib/admin-modules.ts` and update its test.
