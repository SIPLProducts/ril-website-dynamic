CREATE TABLE public.home_hero_slides (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project text NOT NULL DEFAULT '', headline text NOT NULL DEFAULT '', sub text NOT NULL DEFAULT '', alt text NOT NULL DEFAULT '', image_url text, published boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.home_stats (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), value text NOT NULL, label text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0);
CREATE TABLE public.home_journey_milestones (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), year text NOT NULL, title text NOT NULL DEFAULT '', text text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0);
CREATE TABLE public.home_top (id int PRIMARY KEY DEFAULT 1 CHECK (id = 1), about_eyebrow text NOT NULL DEFAULT 'Who we are', about_title text NOT NULL DEFAULT '', about_paragraphs jsonb NOT NULL DEFAULT '[]', about_highlights jsonb NOT NULL DEFAULT '[]', about_images jsonb NOT NULL DEFAULT '[]', journey_eyebrow text NOT NULL DEFAULT 'Our Journey', journey_title text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.home_hero_slides, public.home_stats, public.home_journey_milestones, public.home_top TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_hero_slides, public.home_stats, public.home_journey_milestones, public.home_top TO authenticated;
GRANT ALL ON public.home_hero_slides, public.home_stats, public.home_journey_milestones, public.home_top TO service_role;
ALTER TABLE public.home_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_top ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero public read" ON public.home_hero_slides FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "hero staff write" ON public.home_hero_slides FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "stats public read" ON public.home_stats FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "stats staff write" ON public.home_stats FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "journey public read" ON public.home_journey_milestones FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "journey staff write" ON public.home_journey_milestones FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "home_top public read" ON public.home_top FOR SELECT USING (true);
CREATE POLICY "home_top staff write" ON public.home_top FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
INSERT INTO public.home_hero_slides (project, headline, sub, alt, image_url, sort_order) VALUES
('Leachate Treatment and Disposal Project, Hyderabad','Building the infrastructure that carries a nation forward.','Leachate Treatment and Disposal Project, Hyderabad — safeguarding the city''s environment through advanced waste management, delivered responsibly, at scale.','Aerial view of the Leachate Treatment and Disposal Project, Hyderabad','asset:hero-leachate',1),
('Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir','Engineering Infrastructure. Enabling Progress.','Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir — dependable all-weather connectivity across the Himalayas, built to national highway standards.','Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir — snow-lined expressway with toll plaza','asset:hero-srinagar',2),
('410 MLD Water Treatment Plant, Nalgonda','Engineering the foundations of progress.','410 MLD Water Treatment Plant, Nalgonda — delivering safe, reliable drinking water at scale for communities across the region.','Aerial view of the 410 MLD Water Treatment Plant, Nalgonda','asset:hero-nalgonda',3),
('Lift Irrigation Schemes, Barrages and Reservoirs','Engineering Infrastructure. Enabling Progress.','Lift irrigation schemes, barrages and reservoirs carrying water to farmland and industry.','Concrete dam and irrigation headworks with open gates','asset:hero-slide3',4),
('NAM Expressway Bridge','Engineering the foundations of progress.','Landmark bridge structures built to serve generations — safe, durable and beautifully engineered.','Aerial view of a road bridge spanning a wide river','asset:hero-nam',5);
INSERT INTO public.home_stats (value, label, sort_order) VALUES ('30+','Years of Experience',1),('500+','Projects executed across sectors',2),('1,000+','Employees',3),('PAN India','Presence',4),('₹13,000 Cr','Order Book',5);
INSERT INTO public.home_journey_milestones (year, title, text, sort_order) VALUES
('1994','Founded','Ramky begins as a civil contracting firm in Hyderabad.',1),
('2000','Environment entry','Pioneering integrated waste management facilities in India.',2),
('2005','National scale','Water, irrigation and highway EPC contracts across multiple states.',3),
('2010','Public listing','Ramky Infrastructure Limited lists on NSE and BSE.',4),
('2016','Overseas delivery','Projects executed in the Middle East and Africa.',5),
('2024','Next decade','HAM highways, smart-city works and large lift irrigation schemes.',6);
INSERT INTO public.home_top (id, about_title, about_paragraphs, about_highlights, about_images, journey_title) VALUES (1,
'An integrated developer of essential public infrastructure.',
jsonb_build_array(
'Ramky Infrastructure Limited (Ramky Infra) is a flagship company of Ramky Group, one of the emerging leaders in the field of infrastructure development & environment management. Since the incorporation of its business in 1994, the Company has proudly completed a wide range of construction and infrastructure projects in various sectors such as water and wastewater, transportation (including terminals), irrigation, industrial construction (including SEZs & industrial parks), power transmission and distribution, buildings (including residential, commercial & retail property).',
'With a highly skilled team of over 2000 people, headquartered in Hyderabad, Telangana, the Company manages its business operations in India and internationally. The pan-India presence has enabled the company to serve the growing infrastructure needs across the country. Ramky Infrastructure Ltd is a customer centric, environment concerned and development oriented company.',
'Ramky Infra operates mainly in three principal business segments — the Construction Business & international business is operated directly by the Company and the Developer business is operated through its subsidiaries & associates.',
'Employing the public-private partnership model, Ramky has successfully utilized its core strengths and competencies to fulfill the cutting edge client requirements. The International Business is operated by the Ramky Infrastructure which takes up activities of overseas business explorations in areas such as infrastructure development, roads, and water & waste water.',
'Ramky Infra is ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 certified for Quality Management Systems, Environment Management System and Occupational Health & Safety Management Systems which the Company applies to the design, development, engineering, procurement and construction of projects.'),
'[{"t":"Safety first","d":"Zero-harm site culture"},{"t":"Sustainable","d":"Low-impact delivery"},{"t":"Integrated","d":"Concept to O&M"}]'::jsonb,
'[{"url":"asset:who-main","alt":"Aerial view of a highway curving through dense forest","position":"50% 55%"},{"url":"asset:who-1","alt":"Aerial view of the Nagole sewage treatment plant","position":"60% 50%"},{"url":"asset:who-2","alt":"Aerial view of a residential housing project","position":"50% 40%"}]'::jsonb,
'Three decades of building, milestone by milestone.');