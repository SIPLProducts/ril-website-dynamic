CREATE TABLE IF NOT EXISTS public.strength_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.strength_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strength_items TO authenticated;
GRANT ALL ON public.strength_items TO service_role;
ALTER TABLE public.strength_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published strength items" ON public.strength_items FOR SELECT TO anon, authenticated USING (published OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage strength items" ON public.strength_items FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER strength_items_touch BEFORE UPDATE ON public.strength_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();