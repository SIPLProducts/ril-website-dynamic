-- Page visibility (publish/unpublish sub-pages). Run: docker exec -i supabase-db psql -U postgres -d postgres < sql/09_page_visibility.sql
CREATE TABLE IF NOT EXISTS public.page_visibility (
  key text PRIMARY KEY,
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_visibility TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_visibility TO authenticated;
GRANT ALL ON public.page_visibility TO service_role;
ALTER TABLE public.page_visibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads page visibility" ON public.page_visibility FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff insert page visibility" ON public.page_visibility FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update page visibility" ON public.page_visibility FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete page visibility" ON public.page_visibility FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER page_visibility_touch BEFORE UPDATE ON public.page_visibility FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();