UPDATE public.esg_items SET sort_order = CASE title WHEN 'ESG Committee' THEN 1 WHEN 'Risk Management Committee' THEN 2 END
WHERE page_slug='governance' AND kind='governance_item' AND title IN ('ESG Committee','Risk Management Committee');
