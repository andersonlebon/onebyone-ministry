#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/.tools/stripe"

if [[ ! -x "$CLI" ]]; then
  echo "Stripe CLI missing at $CLI"
  echo "Run: mkdir -p .tools && curl -fsSL -o .tools/stripe.tgz \"\$(curl -fsSL https://api.github.com/repos/stripe/stripe-cli/releases/latest | grep -o 'https://[^\"]*linux_x86_64.tar.gz' | head -1)\" && tar -xzf .tools/stripe.tgz -C .tools"
  exit 1
fi

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET)=' "$ROOT/.env.local" | sed 's/\r$//')
  set +a
fi

API_KEY="${STRIPE_SECRET_KEY:-}"
if [[ -z "$API_KEY" ]]; then
  echo "Set STRIPE_SECRET_KEY in .env.local first."
  exit 1
fi

echo "Forwarding Stripe test webhooks to http://localhost:3000/api/stripe/webhook"
echo "Keep this running while testing card donations locally."
echo

exec "$CLI" listen \
  --api-key "$API_KEY" \
  --events checkout.session.completed,invoice.payment_succeeded \
  --forward-to localhost:3000/api/stripe/webhook
