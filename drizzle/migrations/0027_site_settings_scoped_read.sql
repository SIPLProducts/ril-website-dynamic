DROP POLICY IF EXISTS "site_settings public read" ON public.site_settings;
CREATE POLICY "site_settings public read known keys" ON public.site_settings FOR SELECT TO anon, authenticated
  USING (key IN ('esg_trends','esg_images','main_menu','sustainability_nav','pdf_viewer'));
CREATE POLICY "site_settings staff read" ON public.site_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));