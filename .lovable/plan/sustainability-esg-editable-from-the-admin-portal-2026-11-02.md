# Sustainability (ESG) — editable from the admin portal

All four Sustainability pages become editable: **Environmental, Social, Governance, ESG Reporting**. Today their text lives in code; it moves to the database, seeded with exactly what the website shows now, so nothing changes visually until an admin edits.

## Admin portal
Menu: **Sustainability → Environmental / Social / Governance / ESG Reporting** (Soon tags removed). Each page has the same layout, with only the sections that page uses:

1. **Banner** — small heading, title, intro text, optional background image (dark shade keeps text readable; default green background otherwise).
2. **Key figures** — period line (e.g. "FY 2025–26 vs FY 2024–25") and a list of figures (value + label). Add / Edit / Delete (confirm popup) / Live switch / up-down order.
   - Social: figures sit in **groups** (CSR & Social Impact, Workforce & Safety, Inclusion…) — add/rename/reorder groups and the figures in each.
3. **Governance highlight** (Governance only) — highlight title, value ("4/7"), label, and the committees/policies list (add, edit, delete, reorder).
4. **Focus areas** (the expandable sections, e.g. Carbon Reduction) — title + description, Add/Edit/Delete/Live/reorder.
5. **Reports** (ESG Reporting only) — title, year, description, and a **PDF upload (up to 50 MB) or external link**. Website "Download PDF" button then opens the real file; reports without a file show "Coming soon" instead of a dead button.

Popups use the existing branded style, 3 fields per row, required fields: figure value + label, focus area title + description, report title + year.

## Website
`/esg/environmental`, `/esg/social`, `/esg/governance`, `/esg/esg-reporting` read live data; changes appear immediately. Only Live items show. Page tabs and layout stay as they are.

## Technical details
- Migration: `esg_pages` (slug PK, eyebrow, title, hero, metrics_period, banner_image_url, highlight_title/value/label), `esg_items` (id, page_slug, kind in metric|accordion|governance_item|report, group_title nullable, title, value, body, year, url, published, sort_order). Grants + RLS: public reads published, `is_staff` writes. Seed INSERTs from `src/lib/esg-sections.ts`.
- `src/lib/esg-data.functions.ts`: public read server fn, storage paths → signed URLs; files in `investor-documents` bucket under `esg/`.
- Route `admin.sustainability.$slug.tsx`; `admin-modules.ts` marks the 4 pages ready; `esg.$slug.tsx` loader switches to query data (falls back to 404 for unknown slugs).
- Test: admin-modules test updated so all 4 Sustainability pages are editable.
