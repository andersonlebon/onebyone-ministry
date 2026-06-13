import "server-only";

import type { PaymentProvider } from "./types";
import { createStripeProvider } from "./providers/stripe";

export type { DonationParams, DonationSession, PaymentProvider } from "./types";

/**
 * Returns the configured payment provider (currently Stripe). Returns null when
 * no provider is configured so callers can respond gracefully before launch.
 */
export function getPaymentProvider(): PaymentProvider | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) return createStripeProvider(secretKey);
  return null;
}
