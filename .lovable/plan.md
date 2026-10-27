# Accolades: same year heading in admin and website

## What changes
- A financial year is named by its **starting year**. Awards dated 1 April 2026 to 31 March 2027 show under **2026**. Awards from 1 April 2027 go under **2027**.
- **Website:** each row reads **AWARDS** on the left and the year (for example **2026**) on the right, like your screenshot. The "FY 2025-26 / FY ends …" wording goes away.
- **Admin:** each card heading becomes **2026**, with a small grey note "1-04-2026 to 31-03-2027 · 4 awards", so admins still see the exact dates. The Add/Edit popup and the save message use the same "2026" name.
- The newest year opens by default in both places. The empty current-year card still appears in admin automatically.
- Existing awards stay where they are. FY 2025-26 just shows as "2025".

## Technical details
- `src/lib/fiscal-year.ts`: `label` becomes `String(endYear - 1)`, and a new `range` field holds "01-04-YYYY to 31-03-YYYY". Grouping logic stays the same.
- `src/routes/accolades.tsx`: Row title "Awards", right side `fy.label`.
- `src/routes/admin.accolades.tsx`: header shows `fy.label` plus `fy.range · N awards`. Dialog subtitle uses the range.
- Update `src/test/fiscal-year.test.ts`: 15-01-2027 gives "2026", and 01-04-2027 gives "2027".
