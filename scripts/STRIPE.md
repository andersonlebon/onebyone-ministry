# Stripe donations setup

One By One Ministries uses **hosted Stripe Checkout** for card giving. Venmo and bank transfer stay outside Stripe.

## Local development

1. Ensure `.env.local` includes:
   - `STRIPE_SECRET_KEY` (test: `sk_test_...`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for hosted Checkout)
   - `STRIPE_WEBHOOK_SECRET` (from `npm run stripe:listen -- --print-secret`)
   - `DONATION_RATE_LIMIT_SECRET` (`openssl rand -hex 32`)

2. Terminal A:
   ```bash
   npm run dev
   ```

3. Terminal B:
   ```bash
   npm run stripe:listen
   ```

4. Open [http://localhost:3000/donate](http://localhost:3000/donate), choose **Card**, and pay with test card `4242 4242 4242 4242`.

5. Confirm the gift appears under **Admin → Donations**.

## Production (Vercel)

Set these environment variables on the Vercel project:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | Live secret key (`sk_live_...`) when going live; test key for staging only |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe Dashboard webhook endpoint |
| `DONATION_RATE_LIMIT_SECRET` | Same value as local (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.onebyoneministries.org` |

### Webhook endpoint (Stripe Dashboard)

- **URL:** `https://www.onebyoneministries.org/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `invoice.payment_succeeded`

After creating the endpoint, copy the **signing secret** (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`.

## Smoke test checklist

- [ ] One-time card gift completes and appears in admin
- [ ] Cancelled checkout returns to `/donate?status=cancelled`
- [ ] Monthly gift creates a subscription; renewal fires `invoice.payment_succeeded`
- [ ] Duplicate webhook delivery does not duplicate donations (idempotent)
- [ ] Admin dashboard readiness shows Stripe as complete

## Security

- Never commit `.env.local` or live secret keys.
- Rotate keys if they were pasted into chat or shared docs.
- Use test keys locally; switch to live keys only after nonprofit verification and bank setup in Stripe.
