-- One By One Ministries: Supabase-specific policies (RLS, Storage, auth helpers).
-- Table schema is managed by Drizzle: see drizzle/0000_media_assets.sql and `npm run db:push`.

-- Admin role check from app_metadata (never user_metadata).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super-admin'),
    false
  );
$$;

-- RLS on media_assets (table created by Drizzle).
alter table public.media_assets enable row level security;

drop policy if exists "Public read media assets" on public.media_assets;
create policy "Public read media assets"
  on public.media_assets
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert media assets" on public.media_assets;
create policy "Admins insert media assets"
  on public.media_assets
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update media assets" on public.media_assets;
create policy "Admins update media assets"
  on public.media_assets
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete media assets" on public.media_assets;
create policy "Admins delete media assets"
  on public.media_assets
  for delete
  to authenticated
  using (public.is_admin());

-- Public media bucket for website images uploaded by admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media bucket" on storage.objects;
create policy "Public read media bucket"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "Admins insert media bucket" on storage.objects;
create policy "Admins insert media bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins update media bucket" on storage.objects;
create policy "Admins update media bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins delete media bucket" on storage.objects;
create policy "Admins delete media bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
