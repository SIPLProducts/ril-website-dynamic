-- 1) First create the user in Studio > Authentication > Add user (tick "Auto Confirm User")
-- 2) Change the email/name below if needed, then run this file
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'sunilkumar@sharviinfotech.com'
ON CONFLICT DO NOTHING;
INSERT INTO public.admin_profiles (user_id, full_name, email, phone, otp_required, is_active)
SELECT id, 'Sunil Kumar', email, '', false, true FROM auth.users WHERE email = 'sunilkumar@sharviinfotech.com'
ON CONFLICT (user_id) DO UPDATE SET is_active = true, otp_required = false;
SELECT u.email, r.role, p.is_active FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id JOIN public.admin_profiles p ON p.user_id = u.id;
