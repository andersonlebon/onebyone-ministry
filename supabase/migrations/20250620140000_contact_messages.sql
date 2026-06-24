-- RLS for contact_messages (table created by Drizzle: drizzle/0002_contact_messages.sql)

alter table public.contact_messages enable row level security;

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins update contact messages" on public.contact_messages;
create policy "Admins update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts happen via server actions using DATABASE_URL (elevated connection).
