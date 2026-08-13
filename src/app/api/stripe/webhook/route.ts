import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { isDatabaseConfigured } from "@/lib/db/config";
import { createDonationIdempotent } from "@/lib/db/donations";
import { constructStripeWebhookEvent } from "@/lib/stripe/webhook";
import { getStripeClient } from "@/services/payments/providers/stripe";

export const runtime = "nodejs";

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

function donationDate(epochSeconds?: number | null) {
  return new Date(epochSeconds ? epochSeconds * 1000 : Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function recordCheckoutSession(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  if (
    session.payment_status !== "paid" ||
    !session.amount_total ||
    session.amount_total <= 0 ||
    session.metadata?.source !== "onebyone-donation"
  ) {
    return;
  }

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.donor_email;
  if (!email) {
    console.warn("[stripe-webhook] Paid donation Checkout session had no donor email", {
      eventId: event.id,
      sessionId: session.id,
    });
    return;
  }
  const stripeTransactionId =
    stripeId(session.payment_intent) ??
    stripeId(session.subscription) ??
    session.id;

  await createDonationIdempotent({
    name:
      session.metadata?.donor_name ||
      session.customer_details?.name ||
      email.split("@")[0],
    email,
    amount: session.amount_total / 100,
    currency: "USD",
    method: "card",
    status: "completed",
    frequency: session.metadata?.frequency === "monthly" ? "monthly" : "one-time",
    date: donationDate(session.created),
    notes: "Stripe Checkout",
    transactionId: stripeTransactionId,
    providerEventId: event.id,
    stripeTransactionId,
    stripeSubscriptionId: stripeId(session.subscription),
  });
}

async function recordRenewalInvoice(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  if (
    invoice.billing_reason === "subscription_create" ||
    invoice.status !== "paid" ||
    invoice.amount_paid <= 0
  ) {
    return;
  }

  const invoiceLinks = invoice as unknown as {
    subscription?: string | { id: string } | null;
    parent?: {
      subscription_details?: {
        subscription?: string | { id: string } | null;
      } | null;
    } | null;
  };
  const subscriptionId =
    stripeId(invoiceLinks.parent?.subscription_details?.subscription) ??
    stripeId(invoiceLinks.subscription);
  if (!subscriptionId) return;

  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
  if (subscription.metadata.source !== "onebyone-donation") return;

  const email = invoice.customer_email ?? subscription.metadata.donor_email;
  if (!email) {
    console.warn("[stripe-webhook] Paid renewal invoice had no donor email", {
      eventId: event.id,
      invoiceId: invoice.id,
    });
    return;
  }

  await createDonationIdempotent({
    name:
      subscription.metadata.donor_name ||
      invoice.customer_name ||
      email.split("@")[0],
    email,
    amount: invoice.amount_paid / 100,
    currency: "USD",
    method: "card",
    status: "completed",
    frequency: "monthly",
    date: donationDate(invoice.status_transitions.paid_at),
    notes: "Stripe monthly renewal",
    transactionId: invoice.id,
    providerEventId: event.id,
    stripeTransactionId: invoice.id,
    stripeSubscriptionId: subscriptionId,
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(
      getStripeClient(),
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.warn("[stripe-webhook] Signature verification failed", {
      error: error instanceof Error ? error.message : "Unknown signature error",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await recordCheckoutSession(event);
    } else if (event.type === "invoice.payment_succeeded") {
      await recordRenewalInvoice(event);
    }
  } catch (error) {
    console.error("[stripe-webhook] Valid event could not be persisted", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : "Unknown persistence error",
    });
    return NextResponse.json({ error: "Webhook persistence failed" }, { status: 500 });
  }

  revalidatePath("/admin/donations");
  revalidatePath("/admin/analytics");
  return NextResponse.json({ received: true });
}
