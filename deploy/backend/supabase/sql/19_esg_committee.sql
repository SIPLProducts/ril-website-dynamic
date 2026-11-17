-- 19_esg_committee.sql — adds the ESG Committee details (edited in admin → Sustainability → Governance).
ALTER TABLE public.esg_pages ADD COLUMN IF NOT EXISTS committee jsonb NOT NULL DEFAULT '{}'::jsonb;
