CREATE TABLE public.careers_life_content (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  vision text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  values_intro text NOT NULL DEFAULT '',
  values_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  positions_intro text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.careers_life_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.career_vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  req_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  location text NOT NULL DEFAULT '',
  division text NOT NULL DEFAULT '',
  published_date text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  qualification text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  vacancies integer,
  description text NOT NULL DEFAULT '',
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.career_flyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  url text NOT NULL DEFAULT '',
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.careers_life_content, public.careers_life_sections, public.career_vacancies, public.career_flyers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careers_life_content, public.careers_life_sections, public.career_vacancies, public.career_flyers TO authenticated;
GRANT ALL ON public.careers_life_content, public.careers_life_sections, public.career_vacancies, public.career_flyers TO service_role;
ALTER TABLE public.careers_life_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers_life_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_flyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads careers content" ON public.careers_life_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff write careers content" ON public.careers_life_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads published life sections" ON public.careers_life_sections FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read life sections" ON public.careers_life_sections FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write life sections" ON public.careers_life_sections FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads published vacancies" ON public.career_vacancies FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read vacancies" ON public.career_vacancies FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write vacancies" ON public.career_vacancies FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads published flyers" ON public.career_flyers FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read flyers" ON public.career_flyers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write flyers" ON public.career_flyers FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER t_careers_life_content BEFORE UPDATE ON public.careers_life_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_careers_life_sections BEFORE UPDATE ON public.careers_life_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_career_vacancies BEFORE UPDATE ON public.career_vacancies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_career_flyers BEFORE UPDATE ON public.career_flyers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();