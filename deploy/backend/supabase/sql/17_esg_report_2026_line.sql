-- ESG Reporting: under "Sustainability Report 2026" show
-- "Integrated Report with Sustainability Disclosures".
-- Safe to run repeatedly.

update public.esg_items
set body = 'Integrated Report with Sustainability Disclosures',
    updated_at = now()
where page_slug = 'esg-reporting'
  and kind = 'report'
  and title = 'Sustainability Report 2026';
