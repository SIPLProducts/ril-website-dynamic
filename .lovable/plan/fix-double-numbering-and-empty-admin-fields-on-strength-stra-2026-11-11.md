# Fix double numbering and empty admin fields on Strength & Strategies

## What is wrong
1. **"01. 01. MEN"** - each pillar heading already contains its own number ("01. MEN - People & Expertise"), and the website now adds a second number in front of it.
2. **Admin boxes are empty while the website shows text** - nothing has been saved in those boxes yet. When a box is empty, the website falls back to built-in default text, but the admin page doesn't show that default, so the boxes look blank.

## Fix
1. Stop adding the automatic number to pillar headings. The website will show each heading exactly as it was typed in admin (for example "01. MEN - People & Expertise").
2. Fill the admin boxes with the same text the website is showing now: the pillars heading, Strengths & Strategies heading, tagline, sub heading and paragraphs. What you see in admin will match the website, and you can edit and save it.
3. Clearing a box and saving will still fall back to the default text, as it does today.

## Technical details
- Move the default text from the public pillars component into a shared module, `src/lib/strength-defaults.ts`. The public component and the admin editor will both import it.
- In `AboutContentEditor`, when the slug is `strength-strategies`, fill empty `extra` keys with these defaults on load.
- In `StrengthPillars.tsx`, remove the `padStart` number span.
