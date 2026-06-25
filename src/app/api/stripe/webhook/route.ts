import { NextResponse } from "next/server";

import { createDonation } from "@/lib/db/donations";
import { isDatabaseConfigured } from "@/lib/db/config";
import { verifyStripeWebhookSignature } from "@/lib/stripe/webhook";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id: string;
  amount_total?: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: { donor_name?: string; frequency?: string } | null;
  payment_intent?: string | null;
  subscription?: string | null;
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !verifyStripeWebhookSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: StripeCheckoutSession } };
  try {
    event = JSON.parse(payload) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    if (session?.amount_total && session.amount_total > 0) {
      const email =
        session.customer_email ??
        session.customer_details?.email ??
        "donor@unknown.local";
      const name =
        session.metadata?.donor_name ??
        session.customer_details?.name ??
        "Anonymous";
      const frequency = session.metadata?.frequency === "monthly" ? "monthly" : "one-time";
      const transactionId = session.payment_intent ?? session.subscription ?? session.id;

      await createDonation({
        name,
        email,
        amount: session.amount_total / 100,
        currency: "USD",
        method: "card",
        status: "completed",
        frequency,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        notes: "Stripe Checkout",
        transactionId: String(transactionId),
      });
    }
  }

  return NextResponse.json({ received: true });
}
