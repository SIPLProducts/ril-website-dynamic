-- 1) First create the user in Studio > Authentication > Users (Auto confirm ON)
-- 2) Change the email/name/phone below, then Run
insert into public.user_roles (user_id, role)
select id, 'super_admin' from auth.users where email = 'sunilkumar@sharviinfotech.com'
on conflict do nothing;
insert into public.admin_profiles (user_id, full_name, email, phone, status, otp_enabled)
select id, 'Sunil Kumar', email, '', 'active', false from auth.users where email = 'sunilkumar@sharviinfotech.com'
on conflict (user_id) do update set status = 'active';
