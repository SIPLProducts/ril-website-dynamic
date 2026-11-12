DROP POLICY IF EXISTS "Public reads investor files" ON storage.objects;
DROP POLICY IF EXISTS "Public reads contacts" ON public.ir_contacts;
DROP POLICY IF EXISTS "Staff read contacts" ON public.ir_contacts;
CREATE POLICY "Staff read contacts" ON public.ir_contacts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
REVOKE SELECT ON public.ir_contacts FROM anon;