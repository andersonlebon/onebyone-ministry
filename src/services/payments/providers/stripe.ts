import type { DonationParams, DonationSession, PaymentProvider } from "../types";

/**
 * Stripe Checkout adapter over the REST API (no SDK dependency). Supports
 * one-time and monthly recurring gifts. Card / Apple Pay / Google Pay are all
 * enabled automatically by Stripe Checkout when "card" is allowed.
 * Requires STRIPE_SECRET_KEY.
 */
export function createStripeProvider(secretKey: string): PaymentProvider {
  return {
    name: "stripe",
    async createDonationSession(params: DonationParams): Promise<DonationSession> {
      const recurring = params.frequency === "monthly";
      const body = new URLSearchParams();
      body.set("mode", recurring ? "subscription" : "payment");
      body.set("success_url", params.successUrl);
      body.set("cancel_url", params.cancelUrl);
      body.set("line_items[0][quantity]", "1");
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(Math.round(params.amount * 100)));
      body.set("line_items[0][price_data][product_data][name]", "Donation to One By One Ministries");
      if (recurring) {
        body.set("line_items[0][price_data][recurring][interval]", "month");
      }
      if (params.email) body.set("customer_email", params.email);
      body.set("submit_type", recurring ? "auto" : "donate");

      try {
        const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body
        });
        const data = (await res.json()) as { url?: string; error?: { message?: string } };
        if (!res.ok || !data.url) {
          return { ok: false, error: data.error?.message ?? `Stripe responded ${res.status}` };
        }
        return { ok: true, url: data.url };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  };
}
