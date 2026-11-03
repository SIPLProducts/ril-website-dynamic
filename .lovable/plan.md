# Make two more home page sections editable (under Capabilities)

## Where these sections are today
Both are on the home page, just below the Capability cards, and their text and pictures are currently fixed in the website code:

1. **"Projects that shape places / Landmark Engineering"**: the large slideshow of 9 flagship projects (Srinagar–Banihal, Jawahar Nagar Leachate, 410 MLD WTP, JNPC, NAM Expressway, IIFT Kolkata, Musi River, Ramky One Odyssey, Narela-Bawana). It changes slide every 6 seconds.
2. **"Sustainability: Towards sustainable growth — not as a slogan, as a method."**: the heading, the paragraph, the 2 small figures (1.8 M m³, ISO 14001), the hummingbird video, and the row of 6 figures underneath (22% Reduction, 32% Reduction, 1,695 MT, 45,000+, Zero, Zero).

## New admin menu names
Under **Capabilities** the menu becomes:

```text
Capabilities
  - Capability Cards      (already done)
  - Projects              (already done)
  - Landmark Projects     (new: the "Landmark Engineering" slideshow)
  - Sustainability Highlight (new: the home page Sustainability block with the video)
```

## Landmark Projects screen
- Edit the small heading ("Projects that shape places") and the title ("Landmark Engineering").
- A list of slides. You can add, edit, reorder (up/down), show/hide and delete them.
- Each slide has a project name, a description and a photo. The photo is required.
- Each slide also has a "Photo fit" choice:
  - **Fill**: the photo is cropped to fill the frame.
  - **Show whole photo**: the photo is not cropped. This is for wide combined photos such as NAM, Musi, Odyssey and Narela.
- All 9 current slides are loaded with their current photos, so the website looks the same.

## Sustainability Highlight screen
- Edit the small heading, the main heading line and the paragraph.
- Two small figures beside the text: edit, add or remove them.
- **Video:** keep the current hummingbird video, or upload a new MP4 (up to about 20 MB) with an optional cover picture.
- **Bottom figures row:** add, edit, reorder, show/hide or delete figures. Each figure has a value, a label and a short note.
- All the current text, figures and the video are loaded, so nothing changes until an admin edits it.

## Technical details
- New tables:
  - `landmark_projects`: name, detail, image_url, fit (cover|contain), published, sort_order.
  - `home_sustainability`: a single row holding eyebrow, title, body, side_stats jsonb, video_url and poster_url.
  - `home_sustainability_stats`: value, label, note, published, sort_order.
- The heading text for Landmark Projects goes in `capabilities_settings` as new columns with default values.
- RLS works as for the other screens: anyone can read published rows, and only staff can change them. Grants follow the existing pattern.
- Uploads go to the private bucket under `home/landmarks/` and `home/sustainability/`, stored as `storage:` paths and turned into signed URLs by a public server function (`getHomeHighlights` plus a query in a new `home-highlights.functions.ts`).
- If no file has been uploaded, the current bundled photos and video are used, matched by sort order or key.
- `Projects()` and `Sustainability()` in sections.tsx read from the query, and the index loader preloads it.
- New admin routes: `/admin/capabilities/landmarks` and `/admin/capabilities/sustainability`. Menu entries are added to `admin-modules.ts`.
- The Excel status sheet gets these two rows, marked Completed.
