DROP POLICY IF EXISTS "Public reads footer settings" ON public.footer_settings;
CREATE POLICY "Public reads site footer row" ON public.footer_settings FOR SELECT TO anon, authenticated USING (id = 1);
DROP POLICY IF EXISTS "cap settings public read" ON public.capabilities_settings;
CREATE POLICY "Public reads capabilities settings row" ON public.capabilities_settings FOR SELECT TO anon, authenticated USING (id = 1);
DROP POLICY IF EXISTS "Anyone reads page visibility" ON public.page_visibility;
CREATE POLICY "Public reads hidden pages" ON public.page_visibility FOR SELECT TO anon, authenticated USING (published = false);
CREATE POLICY "Staff read page visibility" ON public.page_visibility FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));