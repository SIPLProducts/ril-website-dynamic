ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

CREATE TABLE public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  otp_required boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER admin_profiles_touch BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.admin_profiles p ON p.user_id = r.user_id
    WHERE r.user_id = _user_id AND r.role::text IN ('admin','super_admin') AND p.is_active)
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.admin_profiles p ON p.user_id = r.user_id
    WHERE r.user_id = _user_id AND r.role::text = 'super_admin' AND p.is_active)
$$;

CREATE POLICY "Users read own profile" ON public.admin_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Super admins read profiles" ON public.admin_profiles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

DROP POLICY "Admins read all docs" ON public.ir_documents;
DROP POLICY "Admins insert docs" ON public.ir_documents;
DROP POLICY "Admins update docs" ON public.ir_documents;
DROP POLICY "Admins delete docs" ON public.ir_documents;
CREATE POLICY "Staff read all docs" ON public.ir_documents FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert docs" ON public.ir_documents FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update docs" ON public.ir_documents FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete docs" ON public.ir_documents FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY "Admins insert contacts" ON public.ir_contacts;
DROP POLICY "Admins update contacts" ON public.ir_contacts;
DROP POLICY "Admins delete contacts" ON public.ir_contacts;
CREATE POLICY "Staff insert contacts" ON public.ir_contacts FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update contacts" ON public.ir_contacts FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete contacts" ON public.ir_contacts FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY "Admins upload investor files" ON storage.objects;
DROP POLICY "Admins update investor files" ON storage.objects;
DROP POLICY "Admins delete investor files" ON storage.objects;
CREATE POLICY "Staff upload investor files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'investor-documents' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update investor files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'investor-documents' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete investor files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'investor-documents' AND public.is_staff(auth.uid()));