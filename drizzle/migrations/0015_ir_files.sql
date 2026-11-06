CREATE TABLE IF NOT EXISTS public.ir_files (
  path text PRIMARY KEY,
  mime text NOT NULL DEFAULT 'application/pdf',
  size integer NOT NULL DEFAULT 0,
  data bytea NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ir_files TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ir_files TO authenticated;
ALTER TABLE public.ir_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage ir files" ON public.ir_files FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));