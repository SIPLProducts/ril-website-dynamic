CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.ir_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'Document',
  doc_date date NOT NULL DEFAULT CURRENT_DATE,
  fy_year text,
  quarter text CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  disclosure_category text,
  version text,
  description text,
  url text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ir_documents_section_idx ON public.ir_documents (section_key);
GRANT SELECT ON public.ir_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ir_documents TO authenticated;
GRANT ALL ON public.ir_documents TO service_role;
ALTER TABLE public.ir_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published docs" ON public.ir_documents FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all docs" ON public.ir_documents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert docs" ON public.ir_documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update docs" ON public.ir_documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete docs" ON public.ir_documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.ir_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heading text NOT NULL,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ir_contacts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ir_contacts TO authenticated;
GRANT ALL ON public.ir_contacts TO service_role;
ALTER TABLE public.ir_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads contacts" ON public.ir_contacts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert contacts" ON public.ir_contacts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update contacts" ON public.ir_contacts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contacts" ON public.ir_contacts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER ir_documents_touch BEFORE UPDATE ON public.ir_documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER ir_contacts_touch BEFORE UPDATE ON public.ir_contacts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Public reads investor files" ON storage.objects FOR SELECT USING (bucket_id = 'investor-documents');
CREATE POLICY "Admins upload investor files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'investor-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update investor files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'investor-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete investor files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'investor-documents' AND public.has_role(auth.uid(), 'admin'));

INSERT INTO public.ir_documents (section_key,title,doc_type,doc_date,fy_year,quarter,disclosure_category,version,description,url,published,sort_order) VALUES
('financials/quarterly-results','Financial Results – Q1 FY 2026–27','Financial Results','2026-08-12','FY 2026–27','Q1',NULL,NULL,NULL,'/__l5e/assets-v1/1a40e113-efe0-43c9-bd38-c0064c0aec84/Q1_26-27.pdf',true,0),
('financials/quarterly-results','Financial Results – Q1 FY 2025–26','Financial Results','2025-08-12','FY 2025–26','Q1',NULL,NULL,NULL,'/__l5e/assets-v1/a5cc15c7-f9d4-4994-aa9b-f063f2a35f5e/Q1_2025-26.pdf',true,1),
('financials/quarterly-results','Financial Results – Q2 FY 2025–26','Financial Results','2025-11-12','FY 2025–26','Q2',NULL,NULL,NULL,'/__l5e/assets-v1/2977a454-f7fc-41a5-b8c9-5f623ddede39/Q2_2025-26.pdf',true,2),
('financials/quarterly-results','Financial Results – Q3 FY 2025–26','Financial Results','2026-02-12','FY 2025–26','Q3',NULL,NULL,NULL,'/__l5e/assets-v1/38f44d9d-68f1-4c5b-85ca-839d9abd1e52/qr-Q3_2025-26.pdf',true,3),
('financials/quarterly-results','Financial Results – Q4 FY 2025–26','Financial Results','2026-05-12','FY 2025–26','Q4',NULL,NULL,NULL,'/__l5e/assets-v1/c602a318-f81a-4f8a-b3b9-32245a907aeb/qr-Q4_2025-26.pdf',true,4),
('financials/quarterly-results','Financial Results – Q1 FY 2024–25','Financial Results','2024-08-12','FY 2024–25','Q1',NULL,NULL,NULL,'/__l5e/assets-v1/884965ff-f5b9-4309-8ee6-66d7b42362e1/Q1_2024-25.pdf',true,5),
('financials/quarterly-results','Financial Results – Q2 FY 2024–25','Financial Results','2024-11-12','FY 2024–25','Q2',NULL,NULL,NULL,'/__l5e/assets-v1/df43aaae-34fd-41cf-b222-27fb781e2898/Q2_2024-25.pdf',true,6),
('financials/quarterly-results','Financial Results – Q3 FY 2024–25','Financial Results','2025-02-12','FY 2024–25','Q3',NULL,NULL,NULL,'/__l5e/assets-v1/87ce45e8-de0a-4fdf-a5f4-4e157861e5db/Q3_2024-25.pdf',true,7),
('financials/quarterly-results','Financial Results – Q4 FY 2024–25','Financial Results','2025-05-12','FY 2024–25','Q4',NULL,NULL,NULL,'/__l5e/assets-v1/bed0da73-63f6-4761-8a24-9d45187860e1/qr-Q4_2024-25.pdf',true,8),
('financials/quarterly-results','Financial Results – Q1 FY 2023–24','Financial Results','2023-08-12','FY 2023–24','Q1',NULL,NULL,NULL,'/__l5e/assets-v1/db08dc95-fee7-4941-96a3-bdc1980d9c65/Q1_2023-24.pdf',true,9),
('financials/quarterly-results','Financial Results – Q2 FY 2023–24','Financial Results','2023-11-12','FY 2023–24','Q2',NULL,NULL,NULL,'/__l5e/assets-v1/9b631820-f1c3-478d-92fd-f107f6437397/Q2_2023-24.pdf',true,10),
('financials/quarterly-results','Financial Results – Q3 FY 2023–24','Financial Results','2024-02-12','FY 2023–24','Q3',NULL,NULL,NULL,'/__l5e/assets-v1/a175fef8-4c49-4e08-8506-50937781d89a/qr-Q3_2023-24.pdf',true,11),
('financials/quarterly-results','Financial Results – Q4 FY 2023–24','Financial Results','2024-05-12','FY 2023–24','Q4',NULL,NULL,NULL,'/__l5e/assets-v1/969cb6f1-3611-44b8-8a10-e259440aabd2/qr-Q4_2023-24.pdf',true,12),
('financials/quarterly-results','Financial Results – Q1 FY 2022–23','Financial Results','2022-08-12','FY 2022–23','Q1',NULL,NULL,NULL,'/__l5e/assets-v1/9e29fb69-fee1-4981-810e-18d1f24c1b95/Q1_2022-23.pdf',true,13),
('financials/quarterly-results','Financial Results – Q2 FY 2022–23','Financial Results','2022-11-12','FY 2022–23','Q2',NULL,NULL,NULL,'/__l5e/assets-v1/4960ab6c-9841-4180-bdc1-fe145e301885/Q2_2022-23.pdf',true,14),
('financials/quarterly-results','Financial Results – Q3 FY 2022–23','Financial Results','2023-02-12','FY 2022–23','Q3',NULL,NULL,NULL,'/__l5e/assets-v1/3bc57c27-1926-47b3-86fb-c7593c1c11e5/qr-Q3_2022-23.pdf',true,15),
('financials/quarterly-results','Financial Results – Q4 FY 2022–23','Financial Results','2023-05-12','FY 2022–23','Q4',NULL,NULL,NULL,'/__l5e/assets-v1/150a5f96-d282-44cf-9779-031ab9944dfc/qr-Q4_2022-23.pdf',true,16),
('corporate-governance/board-and-committees','Board Composition','Board','2026-05-14',NULL,NULL,NULL,NULL,'Current composition of the Board of Directors.','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,17),
('corporate-governance/board-and-committees','Composition of Board Committees','Committee','2026-05-14',NULL,NULL,NULL,NULL,'Audit, Nomination & Remuneration, Stakeholders'' Relationship and CSR committees.','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,18),
('corporate-governance/board-and-committees','Terms of Appointment of Independent Directors','Board','2025-08-02',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,19),
('corporate-governance/policies','Code of Conduct for Board & Senior Management','Policy','2025-11-03',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,20),
('corporate-governance/policies','Whistle Blower / Vigil Mechanism Policy','Policy','2025-06-18',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,21),
('corporate-governance/policies','Related Party Transaction Policy','Policy','2025-04-11',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,22),
('corporate-governance/policies','Nomination & Remuneration Policy','Policy','2024-10-29',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,23),
('corporate-governance/policies','Policy for Determination of Material Events','Policy','2024-02-08',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,24),
('corporate-governance/policies','Dividend Distribution Policy','Policy','2023-05-25',NULL,NULL,NULL,NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,25),
('shareholders-information/moa-and-aoa','Memorandum of Association','MOA','2024-09-26',NULL,NULL,NULL,'v3 (amended)',NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,26),
('shareholders-information/moa-and-aoa','Articles of Association','AOA','2024-09-26',NULL,NULL,NULL,'v3 (amended)',NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,27),
('shareholders-information/regulation-46','Details of Business','Disclosure','2026-04-10',NULL,NULL,'Investor information',NULL,'Overview of business segments and operations.','https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,28),
('shareholders-information/regulation-46','Familiarisation Programme for Independent Directors','Disclosure','2025-04-22',NULL,NULL,'Corporate governance disclosures',NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,29),
('shareholders-information/regulation-46','Shareholding Pattern – Latest Quarter','Disclosure','2026-07-15',NULL,NULL,'Shareholding information',NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,30),
('shareholders-information/regulation-46','Credit Rating Intimation','Disclosure','2025-12-09',NULL,NULL,'Financial information',NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,31),
('shareholders-information/regulation-46','Contact Details for Investor Grievances','Disclosure','2025-10-01',NULL,NULL,'Investor information',NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,32),
('shareholders-information/regulation-46','Schedule of Analyst / Institutional Investor Meets','Disclosure','2026-02-20',NULL,NULL,'Investor information',NULL,NULL,'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',true,33);
INSERT INTO public.ir_contacts (heading,lines,sort_order) VALUES
('Registered Office','[{"value":"Ramky Infrastructure Limited"},{"value":"Ramky Grandiose, Ramky Towers Complex, Gachibowli, Hyderabad – 500 032, Telangana, India"}]'::jsonb,0),
('Investor Relations Contact','[{"label":"Name","value":"Company Secretary & Compliance Officer"},{"label":"Email","value":"investors@ramky.com","href":"mailto:investors@ramky.com"},{"label":"Phone","value":"+91 40 0000 0000","href":"tel:+914000000000"}]'::jsonb,1),
('Registrar & Share Transfer Agent','[{"label":"Name","value":"Registrar name to be confirmed"},{"label":"Email","value":"rta@example.com","href":"mailto:rta@example.com"},{"label":"Phone","value":"+91 00 0000 0000"},{"label":"Website","value":"www.example.com","href":"https://www.example.com"}]'::jsonb,2);