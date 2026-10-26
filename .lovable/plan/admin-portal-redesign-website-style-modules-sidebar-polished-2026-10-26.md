# Admin portal redesign: website-style modules, sidebar, polished popups

## What you get
1. **Collapsible left sidebar organised by website module**, matching the public menu order:
   - Dashboard (overview)
   - About Us, Management, Capabilities, Accolades, Sustainability (ESG), Careers, Media — shown now as "Coming soon" entries so the structure is ready as each module becomes editable
   - **Investors** — expandable dropdown with the same groups as the website (Financials, Corporate Governance, Shareholders Information, Stock Exchange Filings), each opening its sub-pages, plus Investor Contacts
   - **User Management** (Super Admin only) — dropdown with "All users" and "Create user"
   - The sidebar collapses to an icon strip with a button in the top bar; the open group follows the current page.
2. **New professional look**: deep navy sidebar with gold/orange accent for the active item, light content area, a slim white top bar with breadcrumb (e.g. Investors / Financials / Quarterly Results), "View live site", and a profile menu (name, email, role, Logout).
3. **Dashboard home**: summary cards (total documents, live, drafts, users) and recent uploads.
4. **Document page**: page header with document count, search + filter by year/quarter, cleaner table with status badges (Live / Draft), and View / Edit / Delete as tidy icon buttons with tooltips.
5. **Redesigned Upload / Edit and Create user popups**:
   - Branded header strip with icon and short subtitle
   - Fields grouped into sections (Details, Period, File) in a two-column layout
   - Drag-and-drop file area showing file name and size, with "or paste a link" option
   - Publish toggle shown as a clear card; sticky footer with Cancel and gradient Save button
   - Friendly inline error messages instead of the browser's default "Please fill in this field"
6. User Management page gets the same table and popup styling (role and status badges).

## Technical details
- New `src/components/admin/AdminShell.tsx` using shadcn `Sidebar` (`collapsible="icon"`), with module config in `src/lib/admin-modules.ts` (modules list + Investors children from `IR_SECTIONS`) so future modules plug in by adding an entry.
- `/admin` layout route renders the shell around `<Outlet />`; dashboard, document manager (`?section=`), contacts, and users render inside it. Existing guards, data queries and server functions stay unchanged.
- New admin tokens in `src/styles.css` (sidebar navy, accent gradient, badge colours); no hardcoded colours.
- Shared `AdminDialog` and `FileDropzone` components; form validation via zod with inline errors.
