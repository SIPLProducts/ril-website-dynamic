# Make the Clientele page editable from the admin panel

## What the admin will get
A new **About Us > Clientele** item in the admin menu (the "Soon" tag is removed for About Us). The page has three parts:

**0. Top banner**
- Small heading (e.g. "Relationships That Endure"), Title (e.g. "Clientele"), and Subtitle (e.g. "Trusted relationships shaped by commitment...") — all pre-filled.
- Optional background image upload (PNG/JPG/WebP, up to 5 MB) with preview, Replace and Remove. A dark overlay keeps the text readable; without an image the current dark banner stays.

**1. About Ramky block**
- Description text box (pre-filled with the current text).
- Optional image upload (PNG/JPG/WebP, up to 5 MB) with preview, Replace and Remove.
- Save button.

**2. Our Clientele list**
- Table showing logo thumbnail, description, Live/Draft badge, order, and Edit / Delete buttons (Delete uses the same confirm popup).
- **Add Client** popup, same style as other popups:
  - Image: **required** (drag and drop, PNG/JPG/WebP/SVG, up to 5 MB).
  - Description / name: optional.
  - Publish switch and display order.
- Up/down arrows to change order.

## What the public will see on /about/clientele
- About Ramky: the saved description, with the image beside it when one is uploaded.
- Our Clientele: a 3-column grid of cards. Each card shows the logo, with the description under it when given. Only Live entries appear. Changes show right away, with no republishing needed.

## Existing 20+ client names
They are copied in as Live entries with their names as the description and no logo yet. They display as they do now (text with the orange marker) until a logo is uploaded. The required-image rule applies to every entry added or edited from now on.

## Technical details
- New table `about_content` (one row per section slug: `statement`, `image_url`) and `clientele` (id, `image_url` nullable for seeded rows, `description`, `published`, `sort_order`). Grants + RLS: anyone can read published items, and only staff (`is_staff`) can write.
- New private storage folder `about/` in the existing `investor-documents` bucket. Paths are stored as `storage:<path>` and turned into signed URLs by a public read server function, like the investor documents.
- Public route `about.$slug.tsx` loads this data with a server function plus a query (clientele slug only). It falls back to the static text if nothing is saved yet.
- Admin route `admin.about.clientele.tsx` inside AdminShell. `admin-modules.ts` gets an About Us dropdown with Clientele marked ready.
- Validation (image required on create, file type and size limits) goes in `admin-validation.ts`, with a small test.
