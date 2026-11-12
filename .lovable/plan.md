# Strength & Strategies admin: simpler, Excel-style text editing

## 1. Remove the confusing style boxes (screenshot 1)
- Remove the "Card header" and "Card" boxes (font size, weight, colors, roundness, padding, space) and the "What to style" picker from the Design & formatting section.
- Previously saved card/header styles will stop applying, so the website goes back to the normal card look; text formatting is kept.

## 2. More tools in the text editor (screenshot 2), Excel-like
Keep the current toolbar (bold, italic, underline, font, size, weight, text color, alignment, lists, clear) and add:
- Highlight / background color for selected text (fill color)
- Strikethrough, superscript, subscript
- Text box styling for the whole field: background fill, border (color, thickness, style solid/dashed), rounded corners, inner spacing
- Line spacing, indent / outdent
- Insert link, horizontal line
- Undo / redo
- Color pickers with a ready palette of brand colors plus custom color

## 3. Same editor on every field of the page content
Replace plain text boxes with this editor for:
- Pillars: Section heading
- Card 2: Heading, Tagline, Sub heading, Paragraphs
- Each pillar's Title and Description (in the pillar edit form)
Headings use a compact one-line version of the toolbar; paragraphs get the full one. Old plain text keeps showing as before until edited. A small live preview remains under each field.

## Technical details
- Tiptap extensions: @tiptap/extension-highlight (multicolor), subscript, superscript, link, horizontal rule; line-height and box styles as a custom attribute on a wrapping div stored in the HTML.
- Store HTML in existing fields (`about_content.extra.*`, `strength_pillars.title/body` via styles.pillars[id] html) — no database change, no server migration.
- `cleanHtml` allow-list extended: mark, sub, sup, a(href http/https/mailto), hr, div; styles add background-color, border*, border-radius, padding, line-height, margin-left. Public page renders title fields as sanitized inline HTML.
- Remove headerCss/cardCss usage from `StrengthPillars.tsx`; update tests for the new sanitizer rules.
