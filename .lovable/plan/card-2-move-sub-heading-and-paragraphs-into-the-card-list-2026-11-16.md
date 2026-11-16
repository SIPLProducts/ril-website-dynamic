# Card 2: move Sub heading and Paragraphs into the card list

## What changes in admin (About → Strength & Strategies)

Two clearly separate boxes, built the same way:

**Card 1 — Pillars**
- Heading
- Pillars list (optional image, heading, description)

**Card 2 — Strengths & Strategies**
- Heading and Tagline only
- The **Sub heading** and **Paragraphs (one per line)** fields are removed from here.
- Strengths & Strategies cards list (optional image, heading, description), same as Pillars.

## Your existing text is kept
- Today's Sub heading and Paragraphs become the first card in the Card 2 list (Sub heading = card heading, Paragraphs = card description), so nothing is lost and you can edit or delete it there.

## On the website
- Card 2 shows its heading and tagline, then its cards in the same style as the pillar cards.
- The old sub heading/paragraph block no longer shows separately (it now appears as that first card).

## Technical details
- Remove `introSubtitle`/`introBody` from the Card 2 form and stop rendering them in `StrengthPillars.tsx` (and drop them from the auto-fill defaults so they don't reappear).
- One-time data copy into `strength_items` from the current `about_content.extra` values (or the code defaults when empty), only if the list is empty.
- Server: `12_strength_items_seed.sql` with the same copy, then `npm run build` and redeploy.
