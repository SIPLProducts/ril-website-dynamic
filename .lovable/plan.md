# Subsidiaries cards: no double name, compact design

## Fix
- Company **with logo**: logo on top, company name once below it.
- Company **without logo**: name shown once only (no repeated line underneath).

## New compact card look
- Smaller cards: about half the current height; 2 per row on phone, 3 on tablet, 4 on desktop.
- Logo cards: logo area ~80px tall, name in small bold text below, separated by a thin line.
- Name-only cards: a small round badge with the company's initials (e.g. "EC" for Eco Carbon), name beside it in brand blue, so they still look designed, not empty.
- Soft border, white card, orange top accent line that appears on hover, gentle lift on hover.
- Clicking does nothing (same as now).

## Technical details
- Edit only `src/routes/about.partners.subsidiaries.tsx`: render name block conditionally; initials helper; Tailwind tokens already in the project (brand-blue, brand-orange, border, card).
