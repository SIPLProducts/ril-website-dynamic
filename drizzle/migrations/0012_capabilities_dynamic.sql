CREATE TABLE public.capabilities_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow text NOT NULL DEFAULT 'Capabilities',
  title text NOT NULL DEFAULT 'Multi-Disciplinary Spectrum',
  intro text NOT NULL DEFAULT 'Engineering capabilities across essential civil sectors.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.capabilities_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capabilities_settings TO authenticated;
GRANT ALL ON public.capabilities_settings TO service_role;
ALTER TABLE public.capabilities_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cap settings public read" ON public.capabilities_settings FOR SELECT USING (true);
CREATE POLICY "cap settings staff write" ON public.capabilities_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.business_verticals (
  slug text PRIMARY KEY,
  title text NOT NULL,
  card_text text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'building',
  image_url text,
  image_alt text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_verticals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_verticals TO authenticated;
GRANT ALL ON public.business_verticals TO service_role;
ALTER TABLE public.business_verticals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verticals public read" ON public.business_verticals FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "verticals staff write" ON public.business_verticals FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.business_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_slug text NOT NULL REFERENCES public.business_verticals(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  client text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Ongoing' CHECK (status IN ('Ongoing','O&M','Completed')),
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX business_projects_vertical_idx ON public.business_projects(vertical_slug, sort_order);
GRANT SELECT ON public.business_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_projects TO authenticated;
GRANT ALL ON public.business_projects TO service_role;
ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.business_projects FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "projects staff write" ON public.business_projects FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER cap_settings_touch BEFORE UPDATE ON public.capabilities_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER verticals_touch BEFORE UPDATE ON public.business_verticals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.business_projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.capabilities_settings(id) VALUES (1);