# Strength & Strategies – Admin styling controls

Scope: only the Strength & Strategies page and its admin screen. Other pages stay untouched. Current text, images and pillar cards are kept; with no styling saved, the page looks exactly as it does today.

## What the admin gets

1. **Rich-text editor** (replaces plain text boxes for pillar descriptions and the Strengths & Strategies paragraphs):
   bold, italic, underline, font family (from a fixed list of site-safe fonts), font size, font weight, text color, alignment (left/center/right/justify), bullet and numbered lists.
2. **Card header settings** (each pillar card, plus the Strengths & Strategies card): header text, font size, weight (normal/bold), text color, background color, alignment, border color.
3. **Card settings** (per card): background color, border color, corner roundness, header background, content text color, padding, spacing.
4. **Page-wide defaults**: one style set that applies to all pillar cards, with each card able to override it.
5. **Live preview** beside the form showing the card exactly as the website will render it, updating as you type, before saving.
6. **Reset to default** button per card and for the whole page, restoring today's look.
7. Save stores everything in the database; the website shows it right after save or refresh.

## Responsive behaviour
Font sizes from the admin are capped and scaled down on phones/tablets so big sizes don't break small screens. Padding is limited to a safe range.

## Safety
Formatted text is cleaned on the server before saving and before display (only allowed tags/styles), so pasted scripts or broken HTML can't harm the site.

## Server deployment
One new database change file (adds a style column to pillars and uses the existing page settings field for the Strengths & Strategies card). You run it with psql on the server, then rebuild and redeploy as usual.

## Technical details
- Editor: Tiptap (`@tiptap/react`, starter-kit, underline, text-style, color, font-family, text-align, plus a small font-size/weight extension).
- Storage: `strength_pillars.style jsonb default '{}'` (per-card header/card styles); `about_content.extra` keys `pageStyle` (default card style) and `introStyle`; rich text saved as sanitized HTML in existing `body` / `introBody` (old plain text with line breaks still renders, converted to paragraphs on first edit).
- Sanitizing with an allow-list (sanitize-html style, worker-safe) in the save server function and on render.
- Shared `CardStyle` type + `toCss()` helper in `src/lib/strength-style.ts`, used by both preview and public `StrengthPillars` so preview = live output; values clamped (font 12–48px, padding 0–64px, radius 0–32px), font sizes use `clamp()` for mobile.
- New migration `09_strength_styles.sql` for the self-hosted server.
