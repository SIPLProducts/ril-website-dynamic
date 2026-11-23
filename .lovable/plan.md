# Sustainability Admin and Careers Email: Audit Findings and Gap-Closing Plan

The audit used read-only checks of the code and the preview database. The live server's own database and logs were not available, so live-server results are marked as not checked.

## Careers email: root cause

Three problems, in order of impact:

1. **The live server is missing its mail-sending library (confirmed in code).**
   - On the self-hosted server, emails are sent with a library called "nodemailer". It is not listed in the project's dependencies, so `npm install` never installs it.
   - Every send attempt fails. The error is caught and logged quietly, so the candidate still sees "Application submitted" and no email goes out.
   - Adding SMTP details alone would **not** fix this.
2. **The mail server login is empty (confirmed in the preview database).**
   - In Email Configuration, Enabled is ON and the host is `smtp.gmail.com:587`. But the username, password and From email are all blank.
   - The system treats it as "not ready" and skips sending.
3. **Failures can't be seen.**
   - The application screen doesn't show whether an email failed or why.
   - The Test Email button isn't currently a reliable way to prove delivery on the live server.

Other details:
- The recipient is correct (careers@ramky.com).
- The resume is attached as base64 with its original file name.
- Reply-To is set to the candidate.
- The password is stored server-only and is never shown in the browser.
- There are 0 applications in the preview database, so the pipeline has never run end to end here.

## Audit table

| Feature | Status | Admin | Dev needed | Missing | Change needed | Tested |
|---|---|---|---|---|---|---|
| Edit chart values / years | Implemented, not tested | Yes | No | — | — | Charts render; admin save not tested |
| Add new chart (metric) | Partially implemented | Partial | Yes | A chart only shows if its name exactly matches a figure card's label | Link each chart to a figure card | No |
| Chart type selection | Not implemented | No | Yes | Bar chart only | Add a type option (bar/line) | — |
| Chart title, unit, notes, source, summary | Implemented, not tested | Yes | No | — | — | No |
| Upload, replace, delete PDFs | Implemented, not tested | Yes | No | — | — | Viewer tested |
| PDF title, description, visibility | Implemented, not tested | Yes | No | — | — | No |
| Download on/off, button text | Implemented, not tested | Yes (all reports) | No | Can't set per report | Optional per-report switch | No |
| Create new Sustainability page | Not implemented | No | Yes | The five pages are fixed in code | Page builder | — |
| Delete page / change web address | Not implemented | No (hide only) | Yes | — | Page builder | — |
| Edit page text, banner, images | Implemented, not tested | Yes | No | — | — | No |
| Add / remove / reorder sections in a page | Partially implemented | Partial | Yes | Section types and their order are fixed in code | Section-order setting | — |
| Publish / unpublish a page | Implemented, not tested | Yes | No | — | — | No |
| Rename and reorder navigation | Implemented, not tested | Yes | No | — | — | No |
| Add a navigation item / link to a new page | Not implemented | No | Yes | — | Comes with the page builder | — |
| Section headings | Implemented, not tested | Yes | No | — | — | No |
| ESG Committee, policies, accolades | Implemented, not tested | Yes | No | — | — | No |
| Careers email | Not working | Partial | Yes | Mail library missing, login empty, failures hidden | See phase 1 | No |

## Already manageable in admin

- Page text and banners.
- Figures, focus areas, policies, committees and reports, including PDFs (add, edit, delete, reorder, publish).
- ESG Committee.
- Accolades.
- Chart values, years, notes and sources.
- Side photos and framework logos.
- Main menu order.
- Sustainability tab order and names.
- PDF viewer options.
- Section headings.
- Page visibility.
- Email recipients.

## Still needs a developer

- New, deleted or renamed-address pages.
- New navigation links.
- Section layout and order within a page.
- Chart types.
- Linking a new chart to a figure.
- Careers email delivery.

## What can be done without code changes

- Editing all existing content.
- Chart numbers and new years.
- PDFs.
- Images.
- Order and visibility.
- Filling in the SMTP login.

The SMTP login alone will not fix Careers email on the live server.

## Implementation plan

**Phase 1: Careers email (urgent)**
- Add nodemailer to the dependencies so `npm install` installs it on the server.
- Record the send result (sent or failed, with the error) on each application, and show it in Admin → Careers → Applications.
- Add a "Resend email" button.
- Make Send Test Email use the same sending path and show the exact SMTP error. Examples: wrong password, Gmail needs an App Password, port blocked by the firewall.
- Ask the client for real SMTP details. For Gmail, that means an App Password, and the From address must match the account.

**Phase 2: Chart management**
- Add a "Show under figure" picker to each chart, so new charts link to a figure card without exact name matching.
- Add a chart type option: bar or line.

**Phase 3: Page builder**
- Store the list of Sustainability pages in the database: address, title, order and visibility, managed from a new admin screen. The current five pages become rows.
- Let admins create, rename, change the address of and delete pages. Protect the five built-in pages from deletion.
- Add a per-page section layout setting: show or hide, and order, for banner, figures, highlight, details, reports and contact.
- Build the menu, tabs and footer from this list, so new pages appear automatically.
- Old addresses redirect when a page's address changes.

**Phase 4: Testing**
- Sign in as a test admin and check each admin save.
- Submit a test application and confirm the email arrives with the resume attached.

## Technical notes
- `src/lib/send-mail.server.ts` dynamically imports `"nodemailer"`; it is absent from `package.json`.
- In `careers-apply.functions.ts`, the `catch` swallows errors. Add `email_error text` to `career_applications`.
- `getMetricTrend` matches charts to figures by normalised label. Add an optional `metricLabel` and a `chartType` to `MetricTrend`.
- `ESG_SECTIONS` in `src/lib/esg-sections.ts` drives the route check, header, footer and admin. Replace it with an `esg_pages` list (adding `sort_order`, `published`, `layout jsonb`) and keep the code defaults as a fallback.
- Each phase ships a numbered SQL file for the live server.
