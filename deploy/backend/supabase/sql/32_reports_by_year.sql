-- Reports grouped by year: current reports become 2026, add 2025 and 2024 sets. Run once.
UPDATE public.esg_items SET year='2026' WHERE page_slug='esg-reporting' AND kind='report' AND year IN ('2026','2025-26');
INSERT INTO public.esg_items (page_slug,kind,title,body,value,year,published,sort_order)
SELECT 'esg-reporting','report', t.title, t.body, '', y.year, true, y.base + t.n
FROM (VALUES ('2025',20),('2024',30)) AS y(year,base),
(VALUES (1,'Sustainability Report 2026','Our flagship annual report covering strategy, performance and targets across environmental, social and governance themes. Integrated report with sustainability disclosures.'),
(2,'BRSR Report','Business Responsibility and Sustainability Report as filed with Indian stock exchanges under SEBI regulations.'),
(3,'GRI Content Index','A topic-by-topic index mapping our disclosures to the GRI Standards for easy reference and comparison.'),
(4,'SASB Framework Disclosure','Sector-specific metrics aligned to the SASB Engineering & Construction Services standard.')) AS t(n,title,body)
WHERE NOT EXISTS (SELECT 1 FROM public.esg_items e WHERE e.page_slug='esg-reporting' AND e.kind='report' AND e.year=y.year);
