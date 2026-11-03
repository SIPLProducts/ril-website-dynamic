CREATE TABLE public.careers_purpose_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.careers_purpose_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careers_purpose_cards TO authenticated;
GRANT ALL ON public.careers_purpose_cards TO service_role;
ALTER TABLE public.careers_purpose_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read purpose cards" ON public.careers_purpose_cards FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Staff read purpose cards" ON public.careers_purpose_cards FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write purpose cards" ON public.careers_purpose_cards FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

INSERT INTO public.careers_purpose_cards (title, body, bullets, sort_order)
SELECT 'Vision', vision, '[]'::jsonb, 1 FROM public.careers_life_content WHERE id = 1
UNION ALL SELECT 'Mission', mission, '[]'::jsonb, 2 FROM public.careers_life_content WHERE id = 1
UNION ALL SELECT 'Values', values_intro, values_list, 3 FROM public.careers_life_content WHERE id = 1;
COMMENT ON COLUMN public.careers_life_content.vision IS 'DEPRECATED: replaced by careers_purpose_cards';
COMMENT ON COLUMN public.careers_life_content.mission IS 'DEPRECATED: replaced by careers_purpose_cards';
COMMENT ON COLUMN public.careers_life_content.values_intro IS 'DEPRECATED: replaced by careers_purpose_cards';
COMMENT ON COLUMN public.careers_life_content.values_list IS 'DEPRECATED: replaced by careers_purpose_cards';

CREATE TABLE public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL,
  reference text NOT NULL DEFAULT '',
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  location text NOT NULL DEFAULT '',
  qualification text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  cover_note text NOT NULL DEFAULT '',
  resume_path text,
  resume_name text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','shortlisted','rejected')),
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.career_applications TO authenticated;
GRANT ALL ON public.career_applications TO service_role;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read applications" ON public.career_applications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update applications" ON public.career_applications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete applications" ON public.career_applications FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX career_applications_created_idx ON public.career_applications (created_at DESC);
CREATE INDEX career_applications_email_idx ON public.career_applications (email, created_at DESC);

ALTER TABLE public.email_settings ADD COLUMN careers_to text NOT NULL DEFAULT 'careers@ramky.com';