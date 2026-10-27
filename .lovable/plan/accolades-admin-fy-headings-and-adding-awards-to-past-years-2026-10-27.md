# Accolades admin: FY headings and adding awards to past years

## What changes

1. **Card headings:** every card heading reads **FY 2026**, **FY 2025** or **FY 2024**. The number is the year the financial year starts in.
   - Closed card: shows only "FY 2026" and the award count.
   - Open card: a line under the heading shows the dates the year covers, for example "From 01-04-2026 to 31-03-2027", before the award list.

2. **New "Add past year" button** (small, at the top right of the Accolades page):
   - It opens the usual Add award popup with a **Financial year** dropdown at the top.
   - The dropdown lists **past years only**, from FY 2025 back to FY 2000. It never shows the current year (FY 2026) or any future year, because the current year already has its own card.
   - The award date can only be set inside the chosen year. After saving, that year's card appears in the list by itself, in the right place, and opens.

3. **No future dates anywhere:** award dates after today are rejected in all award popups, with a short message.

4. **Website:** no change. It keeps its current headings.

## Technical details
- `src/lib/fiscal-year.ts`: add `pastFyStarts(now, from = 2000)`, which returns the start years before the current year (newest first), and `fyDateBounds(endYear, now)`, which returns `{min: 01-04-start, max: min(31-03-end, today)}`.
- `src/routes/admin.accolades.tsx`: card heading `FY ${fy.label}`; date range shown inside the expanded section; header button `Add past year` (size sm, outline) opens `AwardDialog` with `pickYear` mode; the date input gets min/max set from `fyDateBounds`; the save step checks the date is not in the future and falls inside the chosen year.
- Tests in `src/test/fiscal-year.test.ts`: on 27-10-2026, past years start at 2025 and exclude 2026 and 2027; bounds for FY 2026 cap at today; a future date is rejected.
