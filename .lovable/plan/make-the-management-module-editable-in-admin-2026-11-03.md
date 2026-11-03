# Make the Management module editable in admin

The website's Management area has three groups of people, all currently fixed in code:
- **Board of Directors** (7 people, photo + full profile page)
- **Executive Leadership** (CEO, CFO, photo + full profile page)
- **Senior Management** (15 people, photo + name + designation)

## What admins get
Under **Management** in the admin menu (same order as the website):
1. **Board Of Directors**
2. **Executive Leadership** (new menu item)
3. **Senior Management**

Each screen has a table with photo, name, designation, order, Live/Hidden status, and edit/delete buttons, matching the other admin modules.
- **Add / Edit popup**: photo upload (JPG/PNG/WebP), name and designation (required), display order, Live toggle.
- Directors and Executives also get profile sections in the popup. Each section accepts several paragraphs or points: Professional Profile, Education/Qualifications, Professional Experience, Areas of Expertise, Awards & Recognition, Other Information. Empty sections are hidden on the website.
- The profile web address is created automatically from the name, and admins can change it.
- Every delete asks for confirmation first.

## Public website
The Board, Executive and Senior Management pages, plus each person's profile page, show only Live records, in the order set by admin. Changes appear without redeploying the site.

## Existing content
All 24 current people, with photos and profile text, are copied into the database once, so nothing changes on the website at launch.

## Technical details
- One `management_people` table: `group` (board|executive|senior), slug, name, designation, image (`storage:` path or existing asset URL), display_order, is_published, and a `sections` jsonb holding paragraph arrays. Grants, RLS: public reads published rows; staff (`is_staff`) have full CRUD.
- Photos go to the existing private bucket under `management/`. The public read server function converts them to signed URLs.
- A seed migration inserts the current people, using their existing asset URLs.
- Server functions go in `src/lib/management.functions.ts`. The admin route is `admin.management.$group.tsx`, and `admin-modules.ts` links all three pages.
- Public routes (`senior-management`, `board-of-directors.$slug`, `executive-leadership.$slug`, and list pages) change to loader + query. The static files stay only as types and section headings.
