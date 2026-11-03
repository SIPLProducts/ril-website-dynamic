ALTER TABLE public.capabilities_settings
  ADD COLUMN landmark_eyebrow text NOT NULL DEFAULT 'Projects that shape places',
  ADD COLUMN landmark_title text NOT NULL DEFAULT 'Landmark Engineering';

CREATE TABLE public.landmark_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  detail text NOT NULL DEFAULT '',
  image_url text,
  fit text NOT NULL DEFAULT 'cover' CHECK (fit IN ('cover','contain')),
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.landmark_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landmark_projects TO authenticated;
GRANT ALL ON public.landmark_projects TO service_role;
ALTER TABLE public.landmark_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "landmarks public read" ON public.landmark_projects FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "landmarks staff write" ON public.landmark_projects FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.home_sustainability (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow text NOT NULL DEFAULT 'Sustainability',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  side_stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  poster_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_sustainability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_sustainability TO authenticated;
GRANT ALL ON public.home_sustainability TO service_role;
ALTER TABLE public.home_sustainability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home sus public read" ON public.home_sustainability FOR SELECT USING (true);
CREATE POLICY "home sus staff write" ON public.home_sustainability FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.home_sustainability_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_sustainability_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_sustainability_stats TO authenticated;
GRANT ALL ON public.home_sustainability_stats TO service_role;
ALTER TABLE public.home_sustainability_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home sus stats public read" ON public.home_sustainability_stats FOR SELECT USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "home sus stats staff write" ON public.home_sustainability_stats FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER landmarks_touch BEFORE UPDATE ON public.landmark_projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER home_sus_touch BEFORE UPDATE ON public.home_sustainability FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER home_sus_stats_touch BEFORE UPDATE ON public.home_sustainability_stats FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();