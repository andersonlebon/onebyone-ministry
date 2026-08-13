-- Bank proof documents may contain personal or financial details. Keep them
-- separate from the public media bucket and access them only through signed URLs.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'donation-receipts',
  'donation-receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies are created. Anonymous and normal authenticated
-- clients cannot list or read this bucket. Uploads use one-time signed targets;
-- admin downloads use short-lived signed URLs created by the service role.

alter table if exists public.donation_receipt_uploads enable row level security;
alter table if exists public.donation_request_log enable row level security;
do $$
begin
  if to_regclass('public.donation_receipt_uploads') is not null then
    execute 'revoke all on table public.donation_receipt_uploads from anon, authenticated';
  end if;
  if to_regclass('public.donation_request_log') is not null then
    execute 'revoke all on table public.donation_request_log from anon, authenticated';
  end if;
end
$$;
