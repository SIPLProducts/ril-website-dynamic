# Pillar numbering: 1, 2, 3

On the Strength & Strategies page, each pillar card heading will start with a plain number: "1. Men / People", "2. Materials", and so on.

- Numbers follow the order of pillars that are live on the website, so hiding or deleting a pillar renumbers the rest automatically.
- If a heading already starts with a number you typed (like "01." or "1."), that typed number is removed first, so the website never shows a double number.
- Admin headings stay exactly as typed.

## Technical details
- `src/components/site/StrengthPillars.tsx`: strip a leading `^\s*\d+\s*[.)\-–:]?\s*` from the title, then render `{i + 1}.` in an accent span before it.
