-- Hide CSR, Stakeholders, Audit and Whistle Blower items on Governance page (re-enable via admin Live switch)
UPDATE public.esg_items SET published = false
WHERE page_slug = 'governance' AND kind = 'governance_item'
  AND title IN ('CSR Committee','Stakeholders’ Relationship Committee','Audit Committee','Whistle Blower Policy');
