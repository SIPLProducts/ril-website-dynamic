# Strength & Strategies — dynamic "5M Pillars" cards + intro text

## What you will get

**On the website (/about/strength-strategies)**, in this order, below the current description and side image (or right below the description when no image is uploaded):

1. **Pillars section** (from your 2nd screenshot)
   - Section heading: "The 5M pillars of Ramky Infrastructure" (editable)
   - One card per pillar: image on the left, heading + description on the right, thin line between cards. A pillar without an image shows only heading + description full width.
   - Description keeps paragraph breaks; a line starting with "Strategic focus:" shows that label in italics like your screenshot.
2. **Intro block** (from your 1st screenshot)
   - Heading: "Strengths & Strategies"
   - Tagline: "PROVEN CAPABILITIES. INTEGRATED RESOURCES. SUSTAINABLE EXECUTION."
   - Sub heading: "Our Strengths. Our Strategic Advantage."
   - Paragraphs ("At Ramky Infrastructure Limited..." and "Our 5M framework...")

**In admin (About Ramky → Strength & Strategies)**, two new boxes under the existing page editor:
- **Pillars**: add / edit / reorder / hide / delete cards, each with image (optional, with Remove), heading and description, plus the section heading.
- **Intro section**: heading, tagline, sub heading, paragraphs.

The 5 pillars from your screenshot (Men, Material, Machinery, Methodology, Money) are pre-filled with your text; images start empty so you upload your own. Empty boxes are not shown.

## Technical details
- New table `strength_pillars` (title, body, image_url, published, sort_order, timestamps) with grants, RLS (public read published, staff write), touch trigger; seeded with 5 rows. Added to `page-lists` whitelist and `isPublishedFile` so images serve via `/files/`.
- Intro fields + pillars heading stored in `about_content.extra` for slug `strength-strategies`, with code fallbacks.
- Admin: extend `admin.about.$slug.tsx` with extra fields for this slug and a `HomeListEditor` for `strength_pillars` (imageOptional).
- Public: new `StrengthPillars` component rendered in `about.$slug.tsx` (pillars, then intro); loader prefetches the list.
- Server file `08_strength_pillars.sql` (safe to re-run) for the self-hosted database.
