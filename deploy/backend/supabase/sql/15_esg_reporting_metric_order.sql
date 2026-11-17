-- Set the key metric card order and full names on the Sustainability (ESG) Reports page.
-- Display order: 2026, BRSR, GRI, SASB.
-- Icons are selected automatically in the website code from each card's value.

update public.esg_items
set
  sort_order = case value
    when '2026' then 1
    when 'BRSR' then 2
    when 'GRI' then 3
    when 'SASB' then 4
    else sort_order
  end,
  title = case value
    when '2026' then 'Reporting Year'
    when 'BRSR' then 'Business Responsibility and Sustainability Reporting'
    when 'GRI' then 'Global Reporting Initiative'
    when 'SASB' then 'Sustainability Accounting Standards Board'
    else title
  end
where page_slug = 'esg-reporting'
  and kind = 'metric'
  and value in ('2026', 'BRSR', 'GRI', 'SASB');
