-- RLS for project_setup and site_content

alter table public.project_setup enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins write site content" on public.site_content;
create policy "Admins write site content"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update site content" on public.site_content;
create policy "Admins update site content"
  on public.site_content
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete site content" on public.site_content;
create policy "Admins delete site content"
  on public.site_content
  for delete
  to authenticated
  using (public.is_admin());

-- project_setup: no public policies (server uses DATABASE_URL with elevated access)
