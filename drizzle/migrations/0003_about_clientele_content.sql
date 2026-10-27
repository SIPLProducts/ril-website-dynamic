CREATE TABLE public.about_content (
  slug text PRIMARY KEY,
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  banner_image_url text,
  statement text NOT NULL DEFAULT '',
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads about content" ON public.about_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff insert about content" ON public.about_content FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update about content" ON public.about_content FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete about content" ON public.about_content FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER about_content_touch BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.clientele (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  description text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clientele TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientele TO authenticated;
GRANT ALL ON public.clientele TO service_role;
ALTER TABLE public.clientele ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published clients" ON public.clientele FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all clients" ON public.clientele FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert clients" ON public.clientele FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update clients" ON public.clientele FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete clients" ON public.clientele FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER clientele_touch BEFORE UPDATE ON public.clientele FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.about_content (slug, eyebrow, title, subtitle, statement) VALUES
('clientele', 'Relationships That Endure', 'Clientele', 'Trusted relationships shaped by commitment, performance and shared purpose.', 'Every client relationship is approached with the same focus: understand the objective, deliver responsibly and build confidence through performance.');

INSERT INTO public.clientele (description, sort_order) VALUES
('Bihar State Road Development Corporation Ltd.',1),('Hyderabad Growth Corridor Limited',2),('Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',3),('Indore Muncipal Corporation',4),('Irrigation & CAD Department-Govt of Andhra Pradesh',5),('Kanpur Development Authority',6),('Karnataka Urban Water Supply & Drainage Board',7),('Kolkata Municipal Corporation',8),('Lucknow Development Authority',9),('Maharashtra Industrial Development Corporation (MIDC)',10),('Mathura-Vrindavan Development Authority -Govt of UP',11),('National Highways Authority of India (NHAI)',12),('NTPC Limited',13),('PHED-Govt of Andhra Pradesh',14),('PHED-Govt of Rajasthan',15),('PHED-Govt of Telangana',16),('Power Grid Corporation of India',17),('Rail Vikas Nigam Limited (RVNL)',18),('Rajiv Gandhi Housing Corporation Limited',19),('Uttar Pradesh Jal Nigam',20),('V.O. Chidambaranar (VOC) Port',21);