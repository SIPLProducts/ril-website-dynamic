CREATE TABLE public.csr_content (
  id integer PRIMARY KEY DEFAULT 1,
  eyebrow text NOT NULL DEFAULT '', title text NOT NULL DEFAULT '', subtitle text NOT NULL DEFAULT '', intro text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '', cta_url text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.csr_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.media_page (
  id integer PRIMARY KEY DEFAULT 1,
  eyebrow text NOT NULL DEFAULT '', title text NOT NULL DEFAULT '', intro text NOT NULL DEFAULT '',
  card_title text NOT NULL DEFAULT '', card_subtitle text NOT NULL DEFAULT '', card_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_type text NOT NULL DEFAULT 'Press Release', item_date date,
  kicker text, title text NOT NULL, summary text, paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb, source text,
  document_url text, external_url text, link_label text,
  published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.csr_content, public.csr_areas, public.media_page, public.media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.csr_content, public.csr_areas, public.media_page, public.media_items TO authenticated;
GRANT ALL ON public.csr_content, public.csr_areas, public.media_page, public.media_items TO service_role;

ALTER TABLE public.csr_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csr_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads csr content" ON public.csr_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff write csr content" ON public.csr_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads media page" ON public.media_page FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff write media page" ON public.media_page FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads published csr areas" ON public.csr_areas FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read csr areas" ON public.csr_areas FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write csr areas" ON public.csr_areas FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Public reads published media" ON public.media_items FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read media" ON public.media_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write media" ON public.media_items FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER t_csr_content BEFORE UPDATE ON public.csr_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_csr_areas BEFORE UPDATE ON public.csr_areas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_media_page BEFORE UPDATE ON public.media_page FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_media_items BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.csr_content (id, eyebrow, title, subtitle, intro, cta_label, cta_url) VALUES (1, 'CSR', 'Community Stewardship', 'Ramky Foundation & Social Commitment',
 'Infrastructure development creates genuine long-term value when coupled with active community upliftment, natural resource restoration, and livelihood support.',
 'Learn About Ramky Group CSR', 'https://ramkyfoundation.org/');
INSERT INTO public.csr_areas (title, body, sort_order) VALUES
 ('Natural Resource Management', 'Community-scale watershed restoration, rural lake rejuvenation, rainwater harvesting structures, and tree plantation drives around project sites.', 1),
 ('Livelihood & Women Empowerment', 'Vocational skill training for rural youth, supporting self-help groups (SHGs), and micro-enterprise development in project catchment communities.', 2),
 ('Quality Education & Health', 'School infrastructure enhancement, drinking water filtration in village schools, sanitation facilities, and preventive healthcare camps.', 3),
 ('Institutional CSR Implementation Through Ramky Foundation', 'Dedicated non-profit arm implementing targeted socio-economic development initiatives across project clusters in India.', 4);
INSERT INTO public.media_page (id, eyebrow, title, intro, card_title, card_subtitle, card_text) VALUES (1, 'Media Centre', 'Media & Press Releases',
 'News, press releases, media coverage and official publications — latest first.', 'Media', 'News, Press Releases & Publications',
 'Press releases, media coverage, corporate announcements and official publications from Ramky Infrastructure.');
INSERT INTO public.media_items (item_type, kicker, title, paragraphs, source, external_url, link_label, sort_order) VALUES
 ('Media Coverage', 'Leadership Perspective | Featured in Forbes India', 'Building What Comes Next',
  '["Ramky Infrastructure Limited''s vision for the future takes centre stage in this featured article published by Forbes India, highlighting the leadership perspective of our CEO and the company''s journey in shaping the next chapter of infrastructure development.","With a focus on the future of infrastructure, this feature offers an opportunity to explore Ramky''s leadership vision, evolving priorities, and commitment to delivering infrastructure that creates lasting value."]'::jsonb,
  'Forbes India', 'https://www.forbesindia.com/article/upfront/brand-connect/ramky-infrastructure-limited-building-what-comes-next/2999365/1', 'Read the full article', 1);
INSERT INTO public.media_items (item_type, title, summary, sort_order) VALUES
 ('Press Release', 'Ramky Infrastructure receives LOA for ₹588.60 Cr work from RVNL at Bacheli, Chhattisgarh',
  'Ramky Infrastructure received LOA for ₹588.60 Cr of work from RVNL at Bacheli, Chhattisgarh on Engineering, Procurement and Construction (EPC) basis.', 2);