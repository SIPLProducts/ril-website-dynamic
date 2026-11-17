-- Reorder the key metric cards on the Sustainability (ESG) Reports page.
-- Display order becomes: 2026, BRSR, GRI, SASB.
-- Text, values and visibility are unchanged.

update public.esg_items
set sort_order = case
  when value = 'BRSR' then 2
  when value = 'GRI' then 3
  when value = 'SASB' then 4
  else sort_order
end
where page_slug = 'esg-reporting'
  and kind = 'metric';
