CREATE TABLE public.management_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grp text NOT NULL CHECK (grp IN ('board','executive','senior')),
  slug text NOT NULL,
  name text NOT NULL,
  designation text NOT NULL DEFAULT '',
  image_url text,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (grp, slug)
);
GRANT SELECT ON public.management_people TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.management_people TO authenticated;
GRANT ALL ON public.management_people TO service_role;
ALTER TABLE public.management_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published people" ON public.management_people FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all people" ON public.management_people FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert people" ON public.management_people FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update people" ON public.management_people FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete people" ON public.management_people FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER management_people_touch BEFORE UPDATE ON public.management_people FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();