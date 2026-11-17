-- Sustainability Report 2026 card text in the Reports & Frameworks section.
-- The card now reads: flagship annual report sentence + integrated report note.
-- Safe to run more than once.

UPDATE public.esg_items
SET body = 'Our flagship annual report covering strategy, performance and targets across environmental, social and governance themes. Integrated report with sustainability disclosures.',
    updated_at = now()
WHERE page_slug = 'esg-reporting'
  AND kind = 'report'
  AND title = 'Sustainability Report 2026';
