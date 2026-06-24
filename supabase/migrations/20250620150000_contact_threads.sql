-- RLS for contact_threads and contact_thread_messages (tables from drizzle/0003_contact_threads.sql)

alter table public.contact_threads enable row level security;
alter table public.contact_thread_messages enable row level security;

drop policy if exists "Admins read contact threads" on public.contact_threads;
create policy "Admins read contact threads"
  on public.contact_threads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins update contact threads" on public.contact_threads;
create policy "Admins update contact threads"
  on public.contact_threads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read contact thread messages" on public.contact_thread_messages;
create policy "Admins read contact thread messages"
  on public.contact_thread_messages
  for select
  to authenticated
  using (public.is_admin());

-- Inserts happen via server actions using DATABASE_URL (elevated connection).
