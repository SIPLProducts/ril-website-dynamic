# Make all remaining pages editable from Admin

## What gets an admin screen
1. **History & Milestones** (/history-milestones) — add, edit, reorder, hide milestones (year, title, text, optional image). Current 16 milestones are copied in.
2. **Subsidiaries** (/about/partners/subsidiaries) — list of companies with name, optional logo/link, show/hide, order. Current 16 copied in.
3. **Management Systems** (/about/management-systems) — page heading/intro, ISO certificates (name, standard, description, certificate file), policy documents (title, PDF upload).
4. **About sub-pages** (Partners, Strength & Strategies, Geographic Presence, and other About pages) — heading, subtitle, banner image, statement, side image. Uses the existing About content store, so all About pages are edited the same way.
5. **Careers landing** (/careers) — heading, intro and the two cards (title, text, image).
6. **Turn on CSR, Media and Careers** on the live site (remove "Soon") — only if you confirm.

Every page keeps its current look; only the text, images and files become editable. Images and PDFs use the same upload method as other modules, so they work on private IP, public IP and domain.

## Admin menu
New items: About → Pages, Subsidiaries, Management Systems; Company → History & Milestones; Careers → Landing page.

## For your server
I will give one migration file (`06_dynamic_pages.sql`) with new tables + current content, to run with the same `docker exec ... psql` command, then rebuild and `bash deploy.sh`.

## Technical details
- New tables: `history_milestones`, `subsidiaries`, `management_systems_page` (single row), `management_system_items` (kind = certificate|policy), `careers_landing` (single row + cards jsonb). GRANTs, RLS: public SELECT published, staff write via `is_staff`.
- Reuse `about_content` (slug rows) for About sub-pages; seed missing slugs.
- New file references added to the `/files/` published-file check.
- Public pages load via queryOptions + loader `ensureQueryData`, fallback to current static content if empty.
