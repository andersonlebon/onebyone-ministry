import type Stripe from "stripe";

/** Verify a Stripe webhook with timestamp tolerance and secret rotation support. */
export function constructStripeWebhookEvent(
  stripe: Stripe,
  payload: string,
  signature: string,
  webhookSecrets: string,
  toleranceSeconds = 300
) {
  const secrets = webhookSecrets
    .split(",")
    .map((secret) => secret.trim())
    .filter(Boolean);
  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        secret,
        toleranceSeconds
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("No Stripe webhook secret configured.");
}
