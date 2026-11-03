# Editable card group headings on all Sustainability pages

## What you get
- On every Sustainability admin screen (Environmental, Social, Governance, ESG Reporting), the Key Metrics section gets a **Group heading** field — e.g. "CSR & Social Impact", "Workforce & Safety".
- When adding a card, pick an existing heading or type a new one. A new heading creates a new card group on the website automatically, with its own title above the cards.
- Leave the heading blank and the card shows in the main Key Metrics row (as today on Environmental).
- New **"Rename group"** action: change a heading once and every card under it updates.
- Admin table shows cards grouped under their heading so it's clear which card belongs where.
- Website shows groups in the order of their cards (use the up/down arrows to reorder).

## Technical details
- `admin.sustainability.$slug.tsx`: set `grouped` for all metric lists (drop the `slug === "social"` restriction); group rows by `group_title` with sub-header rows; add rename dialog that updates `group_title` for all items of that page+group.
- `esg.$slug.tsx` / `esg-data.functions.ts`: already render grouped metrics generically; verify layout handles any card count (grid falls back to 3 columns).
- No database change needed (`group_title` already exists).
