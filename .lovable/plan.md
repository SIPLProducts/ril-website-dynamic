# Subsidiaries logos + editable Management Systems headings

## 1. Subsidiaries with images (like Clientele)
- Admin (About Ramky → Partners → Subsidiaries): each company gets an optional **logo/image upload** next to the name, with preview, replace and remove.
- Website (/about/partners/subsidiaries): companies show as cards — logo on top, company name below (same look as Clientele). Companies without an image keep showing the name only, so nothing breaks today.
- Images load through the website's own address, so they work on private IP, public IP and domain.

## 2. Management Systems — section headings editable
Today the headings of the two sections are fixed in code. Admin (About Ramky → Management Systems) gets two new boxes:

**Certified Systems section** (cards with "View Certificate" popup)
- Small heading: "Certified Systems"
- Main heading: "Management Systems"
- Intro paragraph

**Our Commitment section** (Quality / HSE policy cards with "View Policy" popup)
- Small heading: "Our Commitment"
- Main heading: "Our Management Commitments"
- Intro paragraph
- Bottom line: "Integrated management systems. Responsible execution. Consistent performance."

Current text is copied in, so the page looks identical until edited. The certificate/policy cards and their PDF popups stay as they are (already editable).

## 3. Server
A new SQL file `07_subsidiaries_mgmt_headings.sql` (safe to re-run) adds the image field for subsidiaries and the heading fields, with current text filled in. Then rebuild + `bash deploy.sh`.

## Technical details
- Migration: `ALTER TABLE subsidiaries ADD COLUMN IF NOT EXISTS image_url text`; heading fields stored in existing `about_content` row for `management-systems` via a new `extra jsonb` column (default `{}`), backfilled with current copy.
- Add `subsidiaries.image_url` to published-file check in `public-files.server.ts`; render via `publishedFileUrl`.
- HomeListEditor: add image field config for subsidiaries; About `$slug` editor shows section-heading fields when slug = management-systems; `ManagementSystems.tsx` reads them with code fallbacks.
