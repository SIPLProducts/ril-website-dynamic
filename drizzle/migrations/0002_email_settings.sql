CREATE TABLE public.email_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,
  host text NOT NULL DEFAULT '',
  port integer NOT NULL DEFAULT 587,
  secure boolean NOT NULL DEFAULT false,
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  from_email text NOT NULL DEFAULT '',
  from_name text NOT NULL DEFAULT 'Ramky Infrastructure — No Reply',
  cc text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.email_settings TO service_role;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.email_settings (id) VALUES (1);