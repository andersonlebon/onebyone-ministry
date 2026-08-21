# Production database safety

**Never run `npm run db:reset` or `npm run db:reset:all` against production without a verified backup.**

These scripts delete live ministry data:

- `site_content` (homepage text, images, finance details, blog posts)
- `donations`
- `media_assets` and all files in the Supabase `media` storage bucket
- `contact_messages`, `contact_threads`, `contact_thread_messages`
- `project_setup` (setup lock / launch state)
- With `--auth`: every Supabase auth user (admin accounts)

The private `donation-receipts` bucket is intentionally outside public-media cleanup. Reset scripts must never delete it. If donation records are reset in a disposable environment, remove receipt files separately with an explicit, receipt-specific retention decision.

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

## Donation launch order

1. Back up the database, then apply `src/lib/db/schema.ts` with `npm run db:push`.
2. Apply `supabase/migrations/20260813100000_private_donation_receipts.sql`; confirm `donation-receipts` is private and limited to 10 MB.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DONATION_RATE_LIMIT_SECRET`, and the canonical `NEXT_PUBLIC_SITE_URL` on Vercel. The publishable Stripe key is optional for hosted Checkout. See `scripts/STRIPE.md` for webhook setup and smoke tests.
4. Register `/api/stripe/webhook` for `checkout.session.completed` and `invoice.payment_succeeded`.
5. Enter the real Venmo handle, finance email, and bank transfer details in Admin → Finance.
6. Test with Stripe test keys first. Before live activation, verify one-time success/cancel, a later monthly renewal, duplicate webhook delivery, private bank proof upload/admin access, and rejection/deletion cleanup.
