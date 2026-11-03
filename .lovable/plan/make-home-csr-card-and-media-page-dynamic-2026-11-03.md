# Make Home CSR card and Media page dynamic

## 1. Home CSR card (Community Stewardship)
Admin screen: **Sustainability → CSR (Home card)** at `/admin/sustainability/csr`.
Editable:
- Small heading ("CSR"), title ("Community Stewardship"), subtitle ("Ramky Foundation & Social Commitment"), intro text
- Focus areas list (title + text): add, edit, reorder, Live on/off, delete with confirm popup
- Button label and link ("Learn About Ramky Group CSR" → ramkyfoundation.org)

Website: same card on the home page, same "Read more" expand and `/#csr` footer link behaviour; content now comes from the database. Current text and 4 focus areas seeded so nothing changes visually.

## 2. Media → Press Releases & Media Coverage
Admin screen: **Media → Press Releases** at `/admin/media` (replaces "Soon").
- Page banner: small heading, title, intro text
- Media items table: date, type (Press Release, Media Coverage, News, Publication, Corporate Announcement, Article, Magazine Feature), title, source, Live switch, order arrows, edit, delete (confirm popup)
- Add/Edit popup: type, date, kicker line, title, summary / full paragraphs, source, thumbnail image upload (optional), PDF upload or external link (optional), link label, Live
- Home "Media" card text (title, subtitle, description) also editable here

Website `/media`: list loads from the database, newest first, existing "load more", PDF/external links open correctly. The 2 current items (Forbes India, RVNL LOA) are seeded.

## Technical details
- Tables: `csr_content` (single row: eyebrow, title, subtitle, intro, cta_label, cta_url) + `csr_areas` (title, text, published, sort_order); `media_page` (single row incl. home card text) + `media_items` (fields mirroring `MediaItem`, paragraphs as jsonb). GRANTs, RLS: public reads published, staff full CRUD via `is_staff`.
- Files in private `investor-documents` bucket under `csr/` and `media/`, stored as `storage:<path>`, signed URLs on public read.
- New `src/lib/csr.functions.ts`, `src/lib/media.functions.ts` (publishable-key reads + query options); home `index.tsx` and `media.tsx` loaders use `ensureQueryData`; `src/lib/media.ts` keeps only types.
- Admin routes `admin.sustainability.csr.tsx`, `admin.media.tsx`; update `admin-modules.ts` menu.
- Update the status Excel: CSR modal and Media marked Completed.
