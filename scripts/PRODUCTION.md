# Production database safety

**Never run `npm run db:reset` or `npm run db:reset:all` against production without a verified backup.**

These scripts delete live ministry data:

- `site_content` (homepage text, images, finance details, blog posts)
- `donations`
- `media_assets` and all files in the Supabase `media` storage bucket
- `contact_messages`, `contact_threads`, `contact_thread_messages`
- `project_setup` (setup lock / launch state)
- With `--auth`: every Supabase auth user (admin accounts)

## Protection

`scripts/db-reset.ts` blocks resets when:

- `NODE_ENV=production`, or
- `DATABASE_URL` matches `PRODUCTION_DATABASE_URL` (set in Vercel to the production pooler URI), or
- `DATABASE_URL` points at the production Supabase project (same host as `NEXT_PUBLIC_SUPABASE_URL`)

To override (emergency only, after backup):

```bash
ALLOW_PRODUCTION_DB_RESET=1 npm run db:reset
# or
npm run db:reset -- --force-production
```

## Safe workflow

1. Take a Supabase backup or export critical tables first.
2. Confirm `DATABASE_URL` in your shell points at the intended project (not production).
3. Use `db:reset` only on local or disposable preview databases.
4. After a dev reset, run `npm run db:push` and apply auth/storage migrations if needed.
