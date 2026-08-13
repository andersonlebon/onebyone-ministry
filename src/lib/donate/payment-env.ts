import "server-only";

import type { PaymentEnvStatus } from "./payment-env-types";

export type { PaymentEnvStatus };

export function getPaymentEnvStatus(): PaymentEnvStatus {
  return {
    stripeKeys: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
  };
}
