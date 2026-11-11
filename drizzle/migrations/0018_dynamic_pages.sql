CREATE TABLE IF NOT EXISTS public.history_milestones (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), year text NOT NULL, text text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.subsidiaries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.management_system_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL DEFAULT 'certificate' CHECK (kind IN ('certificate','policy')), standard text NOT NULL DEFAULT '', title text NOT NULL, icon text NOT NULL DEFAULT 'quality' CHECK (icon IN ('quality','safety','environment')), summary text NOT NULL DEFAULT '', focus_areas text NOT NULL DEFAULT '', cta text NOT NULL DEFAULT '', doc_url text, doc_page text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.careers_landing_cards (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), eyebrow text NOT NULL DEFAULT '', title text NOT NULL, text text NOT NULL DEFAULT '', href text NOT NULL DEFAULT '', image_url text, published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.history_milestones, public.subsidiaries, public.management_system_items, public.careers_landing_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.history_milestones, public.subsidiaries, public.management_system_items, public.careers_landing_cards TO authenticated;
GRANT ALL ON public.history_milestones, public.subsidiaries, public.management_system_items, public.careers_landing_cards TO service_role;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['history_milestones','subsidiaries','management_system_items','careers_landing_cards'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public reads published" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public reads published" ON public.%I FOR SELECT TO anon, authenticated USING (published = true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Staff read all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Staff read all" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Staff insert" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Staff insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Staff update" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Staff update" ON public.%I FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('DROP POLICY IF EXISTS "Staff delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Staff delete" ON public.%I FOR DELETE TO authenticated USING (public.is_staff(auth.uid()))', t);
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_touch', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t || '_touch', t);
  END LOOP;
END $$;

INSERT INTO public.history_milestones (year,text,sort_order)
SELECT * FROM (VALUES
('1994','Ramky Founded',1),
('1995','Enters Water and Wastewater Management',2),
('1998','Expanded to Industrial Parks and Urban Infrastructure',3),
('2004','Launches India’s first sector-specific Industrial Park (VPCL)',4),
('2005','Enters Integrated Township Development (Discovery City)',5),
('2006','First Ever Private Equity across Infrastructure Peers',6),
('2008','Achieves ISO 9001:2008 certification',7),
('2010','Enters capital markets through IPO',8),
('2014','Completed NAM Expressway Road BOT',9),
('2017','Completed India’s largest WTE Plant, Delhi',10),
('2018','Received PCOD for Srinagar-Banihal Expressway',11),
('2021','Completed 2-million-square-foot township project',12),
('2022','Commissioned India’s first leachate treatment plant (2MLD)',13),
('2023','HAM Project in Water & Wastewater',14),
('2025','Completed 320 MLD STP Project with SBR Technology, Nagole, Hyderabad',15),
('2026','Transformation Strategy with 3 New Orders worth INR 6500 Crores',16)
) v WHERE NOT EXISTS (SELECT 1 FROM public.history_milestones);

INSERT INTO public.subsidiaries (name,sort_order)
SELECT * FROM (VALUES
('Chennai Biomining Limited',1),
('Eco Carbon Engineering Solutions Limited',2),
('Ever Blooming Eco Solutions Limited',3),
('Frank Llyod Tech Management Services Limited',4),
('Hyderabad STPS’ Limited',5),
('Hospet Chitradurga Tollways Limited',6),
('Maha Integrated Life Sciences City',7),
('Mallannasagar Water Supply Limited',8),
('MDDA-Ramky ISBus Terminal Limited',9),
('Pantnagar CETP Private Limited',10),
('Ramdil EPC Works Limited',11),
('Ramky Enclave Limited',12),
('Ramky MIDC Agro Processing Park Limited',13),
('Ramky Multi Product Industrial Park Limited',14),
('Ramky Towers Limited',15),
('Srinagar Banihal Expressway Limited',16)
) v WHERE NOT EXISTS (SELECT 1 FROM public.subsidiaries);

INSERT INTO public.management_system_items (kind,standard,title,icon,summary,focus_areas,cta,doc_url,doc_page,sort_order)
SELECT * FROM (VALUES
('certificate','ISO 9001:2015','Quality Management System','quality','A comprehensive quality management framework supporting the design, development, engineering, procurement, construction, operations and maintenance of projects across Buildings, Industrial, Water & Waste Water, Roads and Infrastructure, together with power-sector sub-stations and distribution-line projects.','Design & Development, Engineering, Procurement, Construction, Operations & Maintenance, Power Sub-Stations, Distribution Lines','View Certificate','/__l5e/assets-v1/456bfcda-e6b8-4b12-a6b9-dc1025ca9109/iso-9001-certificate.pdf','',1),
('certificate','ISO 45001:2018','Occupational Health & Safety Management System','safety','A structured health and safety management framework supporting engineering, procurement, construction, operations and maintenance of infrastructure development projects across Buildings, Industrial, Water & Waste Water, Roads and Bridges.','Engineering, Procurement, Construction, Operations & Maintenance, Buildings, Industrial, Water & Waste Water, Roads & Bridges','View Certificate','/__l5e/assets-v1/bb5e532f-6984-4066-b1ec-5879e1420f94/iso-45001-certificate.pdf','',2),
('certificate','ISO 14001:2015','Environmental Management System','environment','An environmental management framework integrated into the engineering, procurement, construction, operations and maintenance of infrastructure development projects across Buildings, Industrial, Water & Waste Water, Roads and Bridges.','Engineering, Procurement, Construction, Operations & Maintenance, Buildings, Industrial, Water & Waste Water, Roads & Bridges','View Certificate','/__l5e/assets-v1/a7a61d3c-be6a-4b4a-b945-47ae052606db/iso-14001-certificate.pdf','',3),
('policy','','Quality Policy','quality','Our Quality Policy establishes a consistent approach to delivering reliable, compliant and high-quality engineering and infrastructure solutions, with a focus on customer requirements, continual improvement and disciplined project execution.','','View Quality Policy','/__l5e/assets-v1/6d9ba5b5-3ee2-4b90-96b6-f7aa4ed0770e/quality-hse-policies.pdf','1',4),
('policy','','HSE Policy','quality','Our HSE Policy reflects our commitment to protecting people, maintaining safe workplaces and minimising environmental impact through responsible practices across project execution and operations.','','View HSE Policy','/__l5e/assets-v1/6d9ba5b5-3ee2-4b90-96b6-f7aa4ed0770e/quality-hse-policies.pdf','2',5)
) v WHERE NOT EXISTS (SELECT 1 FROM public.management_system_items);

INSERT INTO public.careers_landing_cards (eyebrow,title,text,href,image_url,sort_order)
SELECT * FROM (VALUES
('People & Culture','Life at Ramky','At Ramky, we build more than infrastructure. We build capabilities, careers and a culture of continuous learning.','/life-at-ramky','/__l5e/assets-v1/1183f3a8-4449-4d77-a04b-ebb7847907bc/careers-people-culture.jpg',1),
('Career Opportunities','Current Positions','Kick start your career with Ramky Team and explore limitless opportunities.','/current-positions','/__l5e/assets-v1/1b5df2c6-d26a-4602-8e98-005392284405/careers-opportunities.jpg',2)
) v WHERE NOT EXISTS (SELECT 1 FROM public.careers_landing_cards);

INSERT INTO public.about_content (slug,eyebrow,title,subtitle,statement) VALUES
('partners','Working Together','Partners','Collaboration that strengthens delivery and creates enduring value.','Ramky Infrastructure works through purposeful partnerships built around shared standards, dependable execution and long-term outcomes.'),
('management-systems','Built For Consistency','Management Systems','Structured systems that support quality, accountability and continual improvement.','Our management approach brings clear processes, responsible oversight and disciplined delivery together across every stage of infrastructure development.'),
('strength-strategies','How We Move Forward','Strength & Strategies','Experience, capability and focused strategy aligned for sustainable growth.','Ramky Infrastructure combines sector experience with an integrated approach to planning, execution and long-term value creation.'),
('clientele','Relationships That Endure','Clientele','Trusted relationships shaped by commitment, performance and shared purpose.','Every client relationship is approached with the same focus: understand the objective, deliver responsibly and build confidence through performance.'),
('geographic-presence','Where We Operate','Geographic Presence','Infrastructure capabilities extending across India and overseas.','Our presence reflects decades of experience adapting infrastructure expertise to varied regions, environments and project requirements.')
ON CONFLICT (slug) DO NOTHING;