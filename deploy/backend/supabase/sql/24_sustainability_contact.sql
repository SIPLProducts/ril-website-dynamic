ALTER TABLE public.email_settings ADD COLUMN IF NOT EXISTS sustainability_to text NOT NULL DEFAULT 'sustainability@ramky.com';
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL DEFAULT 'sustainability',
  full_name text NOT NULL,
  email text NOT NULL,
  organisation text NOT NULL DEFAULT '',
  message text NOT NULL,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read contact" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff delete contact" ON public.contact_submissions FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));