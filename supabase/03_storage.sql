-- =========================================================
-- IGCA PLATFORM — STORAGE BUCKETS
-- =========================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('research-assets', 'research-assets', true),
  ('learning-assets', 'learning-assets', true)
on conflict (id) do nothing;

-- Avatars: public read, owner-only write (path convention: {user_id}/filename.ext)
create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Research & learning assets: public read (published content), writes via service-role only
create policy "research assets public read" on storage.objects
  for select using (bucket_id = 'research-assets');

create policy "learning assets public read" on storage.objects
  for select using (bucket_id = 'learning-assets');
