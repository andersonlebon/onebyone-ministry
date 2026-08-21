import Stripe from "stripe";

import { stripeCheckoutBranding } from "@/lib/stripe/checkout-branding";
import type { DonationParams, DonationSession, PaymentProvider } from "../types";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
  if (!stripeClient) stripeClient = new Stripe(secret);
  return stripeClient;
}

type CheckoutSessionCreateParams = Stripe.Checkout.SessionCreateParams & {
  branding_settings?: {
    background_color?: string;
    button_color?: string;
    border_style?: "rounded" | "rectangular" | "pill";
    display_name?: string;
  };
};

/** Official Stripe SDK adapter for hosted Checkout. */
export function createStripeProvider(secretKey: string): PaymentProvider {
  return {
    name: "stripe",
    async createDonationSession(params: DonationParams): Promise<DonationSession> {
      if (!params.email) return { ok: false, error: "Donor email is required." };
      const recurring = params.frequency === "monthly";
      const metadata = {
        source: "onebyone-donation",
        frequency: params.frequency,
        donor_name: params.name ?? "",
        donor_email: params.email,
      };
      const branding = stripeCheckoutBranding();

      try {
        const stripe = new Stripe(secretKey);
        const session = await stripe.checkout.sessions.create({
          mode: recurring ? "subscription" : "payment",
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          customer_email: params.email,
          metadata,
          submit_type: recurring ? "auto" : "donate",
          branding_settings: branding.brandingSettings,
          custom_text: branding.customText,
          line_items: [{
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(params.amount * 100),
              product_data: {
                name: branding.product.name,
                description: branding.product.description,
                images: branding.product.images,
              },
              ...(recurring ? { recurring: { interval: "month" as const } } : {}),
            },
          }],
          ...(recurring
            ? { subscription_data: { metadata } }
            : { payment_intent_data: { receipt_email: params.email, metadata } }),
        } satisfies CheckoutSessionCreateParams);
        return session.url
          ? { ok: true, url: session.url }
          : { ok: false, error: "Stripe did not return a Checkout URL." };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
  };
}
