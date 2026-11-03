# Make the website Footer editable from the admin panel

## What the admin will get
A new **Footer** menu in the admin panel with three simple screens:

1. **Footer → Link Columns**
   - Shows the four columns as cards: Company, Businesses, People & Careers, Investors.
   - In each card: add a link (Label + Link address), edit, delete (with confirmation), move up/down, show/hide.
   - Column heading can be renamed; a new column can be added (website shows up to 4 side by side, more wrap below).
   - Link address helper: pick a website page from a dropdown (About Us, Media, CSR, Clientele, Current Positions, Investors tabs, etc.) or type any external link; option "open in new tab".

2. **Footer → Group Companies**
   - Section heading editable: small heading ("Ramky Group"), title ("Group Companies"), side text ("Visit our group companies").
   - Company cards with logo preview: Company name, Website link, Logo image (upload required — PNG/JPG/SVG), show/hide, order, delete with confirmation.
   - "Add company" button; new companies appear on the website footer immediately.

3. **Footer → Contact & About**
   - Short company description under the logo, Address, Phone, Email, bottom tagline ("Towards sustainable growth") and company name in the copyright line (year stays automatic).

Each screen has a short help line at the top explaining what part of the website it changes, and a "View on website" link.

## Data
All current links, the 4 group companies with their existing logos, and contact details will be loaded in first, so the website looks exactly the same until the admin changes something.

## Technical details
- Tables: `footer_settings` (single row: description, address, phone, email, tagline, copyright_name, group eyebrow/title/subtitle), `footer_columns` (title, published, sort_order), `footer_links` (column_id, label, href, new_tab, published, sort_order), `group_companies` (name, url, logo_url, published, sort_order). GRANTs, RLS: public reads published, staff CRUD via `is_staff`; `touch_updated_at` triggers. Seed via INSERTs in the migration; existing logo asset URLs stored as-is.
- Logos upload to the private bucket under `footer/` as `storage:<path>`, converted to signed URLs in the public read.
- `getFooter` server function (publishable client + apikey shim) + `footerQuery`; ensured in root loader; `SiteFooter` reads via query with the hardcoded data kept only as a fallback if loading fails. CSR link keeps its open-modal behaviour when href is `/#csr`.
- Admin routes `/admin/footer/links`, `/admin/footer/group-companies`, `/admin/footer/contact`; new "Footer" entry in `admin-modules.ts`; reuse AdminDialog / ConfirmDelete / button styles.
- Update the Excel status sheet: footer rows → COMPLETED.
