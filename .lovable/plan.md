# Fix field alignment in "Add figure" popup

The third field's long label wraps onto two lines, pushing its input lower than Value and Label.

## Change
- Shorten the label to "Card group heading (optional)" so all three labels sit on one line and the three inputs line up.
- Move the hint "Type a new name to create a new group" to small grey text under the input.

## Technical details
- `src/routes/admin.sustainability.$slug.tsx` line ~299: update Label text, add `<p className="mt-1 text-xs text-muted-foreground">` hint below the Input. Applies to all four Sustainability screens.
