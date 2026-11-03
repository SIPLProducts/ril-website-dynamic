# Admin: new "Company" menu + dynamic Careers screens

## 1. New "Company" menu in the admin panel
Matches the website footer's "Company" column.
- Add a **Company** menu with two screens:
  - **CSR**: moved here from Sustainability. It's the same editor you have today.
  - **Media**: Press Releases & Media, moved here from the separate Media menu.
- Remove "CSR (Home card)" from Sustainability and remove the separate Media menu, so each screen appears in only one place.
- Old admin links still work.

## 2. Careers → Life at Ramky (dynamic)
- Edit the page heading, the Vision, Mission and Values text, and the content sections below them. You can add, edit, reorder, show or hide, and delete sections, and each section can have an optional image.
- The current text gets loaded first, so the website looks exactly the same as it does now.

## 3. Careers → Current Positions (dynamic)
- **Vacancies:** title, location, experience, job description, responsibilities and skills (one per line), and Open/Closed status. You can reorder or delete them.
- **Recruitment flyers:** title, an image upload, a list of roles (each gets its own "Apply Now" button), and Open/Closed status.
- The website shows only Open items. The current vacancies and flyers get loaded first.
- The Apply Now form stays as it is today.

## 4. After building
- Check the website pages and the admin screens in the browser.
- Update the Excel status sheet to mark CSR, Media, Life at Ramky and Current Positions as Completed.

## Technical details
- `admin-modules.ts`: add a `company` module (CSR → `/admin/company/csr`, Media → `/admin/company/media`), and redirect the old `/admin/sustainability/csr` and `/admin/media` paths.
- New tables, each with GRANTs, RLS (public reads published rows, staff use `is_staff`) and the touch_updated_at trigger:
  - `careers_life_content` (single row)
  - `careers_life_sections`
  - `career_vacancies` (with a list column)
  - `career_flyers` (with a roles list column)
- Seed them from the current static careers data, then delete those static files.
- Images go to the private bucket and are shown on the website through signed links.
- Public reads go through server functions in `site-content.functions.ts`, using the route loader together with `useSuspenseQuery`.
