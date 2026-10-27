CREATE TABLE public.accolades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  award_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  category text,
  organisation text NOT NULL DEFAULT '',
  project text,
  description text,
  image_url text,
  alt_text text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.accolades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accolades TO authenticated;
GRANT ALL ON public.accolades TO service_role;
ALTER TABLE public.accolades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published accolades" ON public.accolades FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all accolades" ON public.accolades FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert accolades" ON public.accolades FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update accolades" ON public.accolades FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete accolades" ON public.accolades FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER accolades_touch BEFORE UPDATE ON public.accolades FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.accolades (award_date,title,category,organisation,project,description,image_url,sort_order) VALUES
('2026-01-15','Excellence in Wastewater Management',NULL,'Economic Times – Infra Leadership Awards','Legacy Leachate Treatment Facility, Jawahar Nagar','Recognised for excellence in wastewater management through the legacy leachate treatment facility.',NULL,1),
('2026-01-15','Construction Health, Safety & Environment',NULL,'CIDC Vishwakarma Awards','Ramky One GenNext Tower & GenNext Square','Recognised for construction health, safety and environmental practices.','/__l5e/assets-v1/6c6b9fce-88b3-4d87-b1ce-e07365071df2/CIDC_2025.png',2),
('2026-01-15','Gold – Best Practices in HSE',NULL,'IINA Awards','Ramky One Symphony','Recognised with Gold for best practices in Health, Safety and Environment.','/__l5e/assets-v1/a00a7b5f-2812-4e68-9888-e343de96a2ea/IINA_Awards_2026.png',3),
('2026-01-15','Certificate of Merit – Occupational Safety & Health',NULL,'NSCI Safety Awards','Ramky Fortuna','Recognised for achievement in occupational safety and health practices.',NULL,4),
('2025-01-15','International Safety Award',NULL,'British Safety Council – International Safety Awards 2025','Ramky One Orion','Recognised for adherence to international best practices in occupational health and safety management.','/__l5e/assets-v1/789f5466-606b-4889-9ca7-8b008d1ba6f1/International_Safety_Award_-Orion.png',1),
('2025-01-15','International Safety Award',NULL,'British Safety Council – International Safety Awards 2025','Ramky One Orbit','Recognised for strong occupational health and safety practices aligned with international standards.','/__l5e/assets-v1/7ea2788b-21ba-4eb2-b33a-31f8b04690ab/International_Safety_Award_-Orbit.png',2),
('2025-01-15','Bronze Award – EHS Excellence',NULL,'CII Southern Region EHS Excellence Awards 2024','Ramky One Orbit','Recognised for performance and initiatives in Environmental, Health & Safety management.','/__l5e/assets-v1/8a19c436-806c-4785-84f1-7c537dbc1c8f/Bronze_Award_-_EHS_Excellence_-Orbit.png',3),
('2025-01-15','Performance Excellence Award 2024–25',NULL,'Indian Institution of Industrial Engineering (IIIE)','Ramky Infrastructure Limited','Recognised for its contribution towards the progress of the nation and organisational performance excellence.',NULL,4),
('2025-01-15','Best Finance Transformation Initiative of the Year',NULL,'5th NXTGEN CFO Awards','Ramky Infrastructure Limited','Recognised for its finance transformation initiative and strengthening of financial processes and capabilities.',NULL,5),
('2025-01-15','Certificate of Appreciation – Construction Sector, Group A',NULL,'National Safety Council of India – NSCI Safety Awards 2024','Ramky One Odyssey, Ramky One Symphony, Ramky Genext & WTE Deonar','Recognised for exceptional safety practices implemented across four flagship projects.',NULL,6),
('2024-01-15','Most Admired Emerging Company in Water Infrastructure',NULL,'ET NOW Infra Focus Awards – 9th Edition','Treatment & Disposal of Legacy Leachate','Recognised for its innovative treatment and disposal of legacy leachate until restoration and stabilisation of adjoining ponds.',NULL,1),
('2024-01-15','Sustainable Cities',NULL,'FICCI Smart Urban Innovation Awards – 5th Edition','Legacy Leachate Treatment Project','Recognised for an innovative sustainable urban solution for treatment and disposal of legacy leachate.',NULL,2),
('2024-01-15','3rd Fastest Growing Construction Company – Medium Category',NULL,'Construction World Global Awards – FCC PERGRO 2024','Ramky Infrastructure Limited','Recognised among the fastest-growing construction companies in the medium category.',NULL,3),
('2024-01-15','Achievement Award – Best Professionally Managed Company',NULL,'CIDC Vishwakarma Awards – 15th Edition','Ramky Infrastructure Limited','Recognised for professional management practices and organisational excellence in the construction domain.',NULL,4),
('2024-01-15','Achievement Award – Best Construction Project',NULL,'CIDC Vishwakarma Awards – 15th Edition','Legacy Leachate Treatment Plant, Jawahar Nagar','Recognised for treatment and disposal of legacy leachate and restoration and stabilisation of adjoining ponds.',NULL,5),
('2024-01-15','Achievement Award – Construction Health, Safety & Environment',NULL,'CIDC Vishwakarma Awards – 15th Edition','Ramky One Odyssey','Recognised for strong construction health, safety and environmental implementation.',NULL,6),
('2024-01-15','Achievement Award – Creating Social Development & Impact',NULL,'CIDC Vishwakarma Awards – 15th Edition','CSR Activities – Striving for Sustainable Development','Recognised for CSR initiatives contributing to social development and sustainable community impact.',NULL,7);