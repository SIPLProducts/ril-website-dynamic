# Strength & Strategies: two separate cards, each with its own image cards

## What you will see in admin (About → Strength & Strategies)

**Card 1 — Pillars**
- Pillars heading field (as today).
- Pillars list right under it: each item has an optional image, a heading and a description. A line starting with "Strategic focus:" is highlighted (as today).

**Card 2 — Strengths & Strategies (shown below the pillar cards)**
- Heading, Tagline, Sub heading and Paragraphs fields (kept as they are).
- New list right under it, the same as Pillars: Add / Edit / Delete items, each with an **optional image**, a **heading** and a **description**, a Live switch and ordering.

Each card is a clearly boxed section, so the Card 1 fields and the Card 1 list sit together, and the same goes for Card 2.

## On the website
- Pillar cards stay as they are.
- Card 2 shows its heading/intro text, then its items as cards in the same style as the pillars (image on top when uploaded, heading, description). Cards without an image show only the text.
- If Card 2 has no items, the page looks exactly as it does now.

## Technical details
- New table `strength_items` (same columns as `strength_pillars`: title, description, image_url, sort_order, published), grants anon SELECT / authenticated CRUD / service_role ALL, RLS published-or-staff read, staff manage, touch trigger.
- Add `strength_items` to `PAGE_LIST_TABLES`, the HomeListEditor `Table` type, and the public-files publication check so images serve via `/files/...`.
- `admin.about.$slug.tsx`: render the Pillars list inside Card 1 and a second HomeListEditor (`strength_items`, withImage imageOptional) inside Card 2; AboutContentEditor gets slots to place each list under its card.
- `StrengthPillars.tsx`: reuse PillarCard for the Card 2 items grid; loader prefetches the new list.
- Server file `11_strength_items.sql` for your self-hosted database, then `npm run build` and redeploy.
