ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS email_error text;
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS email_attempted_at timestamptz;
UPDATE public.career_applications SET email_status = 'sent' WHERE email_sent;
