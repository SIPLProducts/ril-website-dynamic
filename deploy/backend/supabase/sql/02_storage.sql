-- Private bucket for all uploaded PDFs and images (admin uploads, resumes).
insert into storage.buckets (id, name, public) values ('investor-documents','investor-documents', false)
on conflict (id) do update set public = false;
drop policy if exists "Staff manage investor files" on storage.objects;
create policy "Staff manage investor files" on storage.objects for all to authenticated
  using (bucket_id = 'investor-documents' and public.is_staff(auth.uid()))
  with check (bucket_id = 'investor-documents' and public.is_staff(auth.uid()));
