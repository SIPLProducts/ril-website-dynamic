# Make Accolades editable from the admin portal

## What you get
- **Admin: About menu → Accolades** becomes clickable (no longer "Soon").
- Admin screen lists all awards grouped by Financial Year, with Add / Edit / Delete (styled confirm), Live/Draft switch and display order.
- Add/Edit award popup (3 fields per row): Award date (required), Award title (required), Category, Awarding organisation (required), Project / initiative, Description, Award photo (optional upload), Live toggle.
- **Financial Year is worked out automatically from the award date** (1 April to 31 March). Example: an award dated 15-01-2027 falls in FY 2026-27, which ends 31-03-2027. No need to create years by hand — the first award in a new FY creates that FY row on the website.
- Page settings (editable): row heading ("AWARDS"), "PAST AWARDS" label, and how many recent FYs get their own row (default 3); older ones go under Past Awards.

## Public Accolades page
- Rows show the FY label, e.g. "FY 2026-27" with "Ends 31-03-2027".
- The **latest FY row opens by default**; others stay collapsed.
- Only Live awards are shown. Existing 2026 cards and photos are copied in so the page looks the same on day one.

## Technical details
- New tables `accolades` (award_date, title, category, organisation, project, description, image_path `storage:<path>`, alt_text, sort_order, published) and `accolades_settings` (single row). GRANTs + RLS: public reads published rows; `is_staff` writes.
- FY computed in a shared helper `fyOf(date)` (month >= April → FY ends 31-03 of next year) with a unit test (15-01-2027 → FY ending 31-03-2027; 10-04-2027 → FY ending 31-03-2028).
- Seed existing awards from `src/lib/accolades.ts` in the migration (existing bundled images keep their asset URLs).
- Images in the private `investor-documents` bucket under `accolades/`, served via signed URLs by a public read server function; route loader fetches it.
- New route `admin.accolades.tsx`; enable it in `admin-modules.ts`.
