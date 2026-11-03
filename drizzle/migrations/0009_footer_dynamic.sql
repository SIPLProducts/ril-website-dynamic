CREATE TABLE public.footer_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  copyright_name text NOT NULL DEFAULT '',
  group_eyebrow text NOT NULL DEFAULT '',
  group_title text NOT NULL DEFAULT '',
  group_subtitle text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.footer_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id uuid NOT NULL REFERENCES public.footer_columns(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  new_tab boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.group_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  logo_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.footer_settings, public.footer_columns, public.footer_links, public.group_companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.footer_settings, public.footer_columns, public.footer_links, public.group_companies TO authenticated;
GRANT ALL ON public.footer_settings, public.footer_columns, public.footer_links, public.group_companies TO service_role;

ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads footer settings" ON public.footer_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage footer settings" ON public.footer_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads live footer columns" ON public.footer_columns FOR SELECT TO anon, authenticated USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage footer columns" ON public.footer_columns FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads live footer links" ON public.footer_links FOR SELECT TO anon, authenticated USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage footer links" ON public.footer_links FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads live group companies" ON public.group_companies FOR SELECT TO anon, authenticated USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "Staff manage group companies" ON public.group_companies FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER t_footer_settings BEFORE UPDATE ON public.footer_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_footer_columns BEFORE UPDATE ON public.footer_columns FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_footer_links BEFORE UPDATE ON public.footer_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_group_companies BEFORE UPDATE ON public.group_companies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.footer_settings (id, description, address, phone, email, tagline, copyright_name, group_eyebrow, group_title, group_subtitle) VALUES
(1, 'An integrated infrastructure developer delivering water, transportation, irrigation, environment and urban infrastructure across India and overseas.',
 'Ramky Grandiose, Sy. No. 136/2 & 4, Gachibowli, Hyderabad 500032, India', '+91 40 2301 5000', 'info@ramkyinfrastructure.com',
 'Towards sustainable growth', 'Ramky Infrastructure Limited', 'Ramky Group', 'Group Companies', 'Visit our group companies');

INSERT INTO public.footer_columns (id, title, sort_order) VALUES
('11111111-0000-4000-8000-000000000001', 'Company', 1),
('11111111-0000-4000-8000-000000000002', 'Businesses', 2),
('11111111-0000-4000-8000-000000000003', 'People & Careers', 3),
('11111111-0000-4000-8000-000000000004', 'Investors', 4);

INSERT INTO public.footer_links (column_id, label, href, sort_order) VALUES
('11111111-0000-4000-8000-000000000001', 'About Us', '/#about', 1),
('11111111-0000-4000-8000-000000000001', 'Management', '/#management', 2),
('11111111-0000-4000-8000-000000000001', 'Awards & Accreditations', '/accolades', 3),
('11111111-0000-4000-8000-000000000001', 'Media', '/media', 4),
('11111111-0000-4000-8000-000000000001', 'CSR', '/#csr', 5),
('11111111-0000-4000-8000-000000000002', 'Capabilities', '/#businesses', 1),
('11111111-0000-4000-8000-000000000002', 'Clientele', '/about/clientele', 2),
('11111111-0000-4000-8000-000000000002', 'Partners', '/about/partners/subsidiaries', 3),
('11111111-0000-4000-8000-000000000003', 'Life at Ramky', '/life-at-ramky', 1),
('11111111-0000-4000-8000-000000000003', 'Current Positions', '/current-positions', 2),
('11111111-0000-4000-8000-000000000004', 'Financial Results', '/investors?cat=financials', 1),
('11111111-0000-4000-8000-000000000004', 'Corporate Governance', '/investors?cat=corporate-governance', 2),
('11111111-0000-4000-8000-000000000004', 'Shareholders Information', '/investors?cat=shareholders-information', 3),
('11111111-0000-4000-8000-000000000004', 'Stock Exchange Filings', '/investors?cat=stock-exchange-filings', 4);

INSERT INTO public.group_companies (name, url, logo_url, sort_order) VALUES
('MILES City', 'https://milescity.in', '/__l5e/assets-v1/0bcc89a6-a782-459c-b20e-cb4343490107/miles-city.png', 1),
('Ramky Estates', 'https://www.ramkyestates.com/', '/__l5e/assets-v1/fd9ea294-c086-4373-a0e3-2b59fe194f6b/ramky-estates.svg', 2),
('Visakha Pharmacity Limited', 'https://visakhapharmacity.com/', '/__l5e/assets-v1/b64bb9f8-d99a-45e1-8527-36ef2ce898b2/visakha-pharmacity.jpg', 3),
('RECEPS', 'https://receps.org/', '/__l5e/assets-v1/bf012b5b-2591-4b85-93a1-59d6b4c990a9/receps.png', 4);