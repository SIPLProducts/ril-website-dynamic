CREATE TABLE public.esg_pages (
  slug text PRIMARY KEY,
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  hero text NOT NULL DEFAULT '',
  metrics_period text NOT NULL DEFAULT '',
  banner_image_url text,
  highlight_title text NOT NULL DEFAULT '',
  highlight_value text NOT NULL DEFAULT '',
  highlight_label text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.esg_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.esg_pages TO authenticated;
GRANT ALL ON public.esg_pages TO service_role;
ALTER TABLE public.esg_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads esg pages" ON public.esg_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff insert esg pages" ON public.esg_pages FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update esg pages" ON public.esg_pages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete esg pages" ON public.esg_pages FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER esg_pages_touch BEFORE UPDATE ON public.esg_pages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.esg_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL REFERENCES public.esg_pages(slug) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('metric','accordion','governance_item','report')),
  group_title text,
  title text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX esg_items_page_idx ON public.esg_items(page_slug, kind, sort_order);
GRANT SELECT ON public.esg_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.esg_items TO authenticated;
GRANT ALL ON public.esg_items TO service_role;
ALTER TABLE public.esg_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published esg items" ON public.esg_items FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all esg items" ON public.esg_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert esg items" ON public.esg_items FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update esg items" ON public.esg_items FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete esg items" ON public.esg_items FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER esg_items_touch BEFORE UPDATE ON public.esg_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.esg_pages (slug,eyebrow,title,hero,metrics_period,highlight_title,highlight_value,highlight_label) VALUES ('environmental','Planet First','Environmental','Infrastructure that respects the planet it is built on — reducing carbon, expanding renewable energy and closing the loop on waste.','FY 2025–26 vs FY 2024–25','','','');
INSERT INTO public.esg_items (page_slug,kind,group_title,title,value,body,year,sort_order) VALUES
('environmental','metric',NULL,'Reduction in Energy Consumption','22%','','',1),
('environmental','metric',NULL,'Reduction in Scope 1 & 2 Emissions','32%','','',2),
('environmental','metric',NULL,'Reduction in Water Consumption','83%','','',3),
('environmental','metric',NULL,'of Waste Generated Was Recycled','98%','','',4),
('environmental','metric',NULL,'Environmental Compliance','100%','','',5),
('environmental','accordion',NULL,'Carbon Reduction','','We measure and manage emissions across every project lifecycle — from material sourcing to construction and operations. Energy-efficient equipment, optimized logistics and low-carbon materials have cut our carbon intensity by 40% against our baseline, with a clear roadmap toward deeper reductions.','',6),
('environmental','accordion',NULL,'Renewable Energy','','Our waste-to-energy and solar installations convert environmental liabilities into clean power. India''s largest waste-to-energy plant in Delhi, delivered by Ramky, processes municipal waste while feeding renewable electricity into the grid.','',7),
('environmental','accordion',NULL,'Waste Management & Circularity','','From engineered landfills to material recovery and leachate treatment, our approach keeps resources in circulation. We design every water and waste project for maximum recovery, reuse and safe disposal — protecting groundwater, soil and communities.','',8),
('environmental','accordion',NULL,'Water Stewardship','','Water is central to our business and our responsibility. Our treatment plants return hundreds of millions of litres of safe water to the environment every day, and our project designs prioritize recycling and recharge.','',9);
INSERT INTO public.esg_pages (slug,eyebrow,title,hero,metrics_period,highlight_title,highlight_value,highlight_label) VALUES ('social','People & Communities','Social','Progress is only real when people share in it — safe workplaces, inclusive teams and communities that grow alongside our projects.','FY 2025–26','','','');
INSERT INTO public.esg_items (page_slug,kind,group_title,title,value,body,year,sort_order) VALUES
('social','metric','CSR & Social Impact','Lives Impacted','45,000+','','',1),
('social','metric','CSR & Social Impact','CSR Activities','50+','','',2),
('social','metric','CSR & Social Impact','CSR Spend','₹58.30 Mn','','',3),
('social','metric','CSR & Social Impact','Health Beneficiaries','26,095','','',4),
('social','metric','CSR & Social Impact','Students Supported','4,686','','',5),
('social','metric','CSR & Social Impact','People Skill-Trained','2,140','','',6),
('social','metric','Workforce & Safety','Employees','1,041','','',7),
('social','metric','Workforce & Safety','Employee Health Insurance Coverage','100%','','',8),
('social','metric','Workforce & Safety','Performance Reviews Completed','100%','','',9),
('social','metric','Workforce & Safety','Workplace Fatalities','0','','',10),
('social','metric','Workforce & Safety','POSH Complaints','0','','',11),
('social','metric','Workforce & Safety','Employees Trained on Health & Safety','87%+','','',12),
('social','metric','Inclusion & Responsible Business','Employees Covered by Equal Opportunity Policies','100%','','',13),
('social','metric','Inclusion & Responsible Business','Medical Coverage for Employees','100%','','',14),
('social','metric','Inclusion & Responsible Business','Procurement from MSMEs','13.9%','','',15),
('social','metric','Inclusion & Responsible Business','Operations Assessed for Health & Safety','100%','','',16),
('social','accordion',NULL,'Diversity & Inclusion','','We are building a workforce that reflects the communities we serve — expanding opportunities for women in engineering and site leadership, and ensuring fair, merit-based growth at every level of the organization.','',17),
('social','accordion',NULL,'Community Impact','','Our CSR programmes focus on education, healthcare, sanitation and skill development in the regions around our projects. We engage local communities early, hire locally where possible, and invest in infrastructure that outlasts construction.','',18),
('social','accordion',NULL,'Employee Wellness & Safety','','Safety is a non-negotiable value, not a statistic. Every site operates under rigorous health and safety systems with continuous training, protective equipment and transparent incident reporting — because every person goes home safe, every day.','',19),
('social','accordion',NULL,'Skills & Livelihoods','','Through on-the-job training and partnerships with local institutions, we help workers build transferable skills that raise incomes long after a project is complete.','',20);
INSERT INTO public.esg_pages (slug,eyebrow,title,hero,metrics_period,highlight_title,highlight_value,highlight_label) VALUES ('governance','Ethics & Accountability','Governance','Trust is built on how we govern — independent oversight, transparent disclosure and ethics that guide every decision.','Current Governance Framework','Independent Board Oversight','4/7','Independent Directors on the Board');
INSERT INTO public.esg_items (page_slug,kind,group_title,title,value,body,year,sort_order) VALUES
('governance','governance_item',NULL,'Risk Management Committee','','','',1),
('governance','governance_item',NULL,'CSR Committee','','','',2),
('governance','governance_item',NULL,'Nomination & Remuneration Committee','','','',3),
('governance','governance_item',NULL,'Stakeholders’ Relationship Committee','','','',4),
('governance','governance_item',NULL,'Audit Committee','','','',5),
('governance','governance_item',NULL,'Zero Reported Corruption Cases','','','',6),
('governance','governance_item',NULL,'Whistle Blower Policy','','','',7),
('governance','accordion',NULL,'Corporate Ethics','','Our Code of Conduct applies to every employee, director and business partner. It covers anti-bribery and anti-corruption, fair competition, conflicts of interest and respectful workplace conduct — reinforced through mandatory training and leadership accountability.','',8),
('governance','accordion',NULL,'Board Oversight & Leadership Standards','','A majority-independent Board with dedicated audit, risk and stakeholder committees provides oversight of strategy, compliance and executive performance. Leadership is held to clear standards of integrity, disclosure and succession planning.','',9),
('governance','accordion',NULL,'Data Privacy & Security','','We protect the data of employees, clients and partners through defined access controls, secure systems and compliance with applicable data protection regulations. Privacy is treated as a governance responsibility, not an IT afterthought.','',10),
('governance','accordion',NULL,'Whistleblower & Grievance Mechanisms','','Confidential channels allow anyone — employees, vendors or community members — to raise concerns without fear of retaliation. Every report is reviewed independently and tracked to resolution.','',11);
INSERT INTO public.esg_pages (slug,eyebrow,title,hero,metrics_period,highlight_title,highlight_value,highlight_label) VALUES ('esg-reporting','Transparency In Action','ESG Reporting','Formal disclosures, frameworks and reports — download our latest ESG publications and track our performance year over year.','','','','');
INSERT INTO public.esg_items (page_slug,kind,group_title,title,value,body,year,sort_order) VALUES
('esg-reporting','metric',NULL,'Latest sustainability report published','2026','','',1),
('esg-reporting','metric',NULL,'Reported with reference to global standards','GRI','','',2),
('esg-reporting','metric',NULL,'Sector-aligned disclosure framework','SASB','','',3),
('esg-reporting','metric',NULL,'SEBI-mandated responsibility reporting','BRSR','','',4),
('esg-reporting','accordion',NULL,'Our Reporting Approach','','We report with reference to the Global Reporting Initiative (GRI) Standards and the SASB framework for engineering and construction, alongside SEBI''s Business Responsibility and Sustainability Reporting (BRSR) requirements. Our disclosures cover environmental performance, workforce and community impact, and governance practices.','',5),
('esg-reporting','accordion',NULL,'Assurance & Data Quality','','Key ESG data points are compiled under internal controls and reviewed by senior management before publication. We are progressively expanding external assurance across our most material metrics.','',6),
('esg-reporting','report',NULL,'Sustainability Report 2026','','Our flagship annual report covering strategy, performance and targets across environmental, social and governance themes.','2026',7),
('esg-reporting','report',NULL,'GRI Content Index','','A topic-by-topic index mapping our disclosures to the GRI Standards for easy reference and comparison.','2026',8),
('esg-reporting','report',NULL,'SASB Framework Disclosure','','Sector-specific metrics aligned to the SASB Engineering & Construction Services standard.','2026',9),
('esg-reporting','report',NULL,'BRSR Report','','Business Responsibility and Sustainability Report as filed with Indian stock exchanges under SEBI regulations.','2025-26',10);