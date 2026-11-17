update public.esg_items set body = 'Sustainability at Ramky Infrastructure Limited is overseen by a dedicated ESG Committee. It was formed by Mr. Sunil Nair, CEO, and meets every quarter guides our ESG strategy, reviews performance and drives progress on our sustainability goals.
Chair: Chief Financial Officer Mr.Sravanth
Members: Heads of ESG & Sustainability, HR, HSE, Supply Chain, IT, Projects, QA/QC and Business Units', updated_at = now()
where id = '775a280d-2f10-40d4-bd20-68027fdc1840';
update public.esg_pages set committee = '{}'::jsonb where slug = 'governance';
