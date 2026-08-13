import { NextResponse } from "next/server";

import {
  DonationRateLimitError,
  enforceDonationRateLimit,
} from "@/lib/db/donation-receipts";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getRequestIp, hashDonationSubject } from "@/lib/donate/request-security";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import { donationSchema } from "@/lib/validation";
import { getPaymentProvider } from "@/services/payments";

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Donation recording is not configured." }, { status: 503 });
    }
    const json = await request.json().catch(() => null);
    const parsed = donationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid donation details." },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "Online giving is not configured yet. Please check back soon or contact us to give." },
        { status: 503 }
      );
    }

    const { amount, frequency, email, name } = parsed.data;
    await enforceDonationRateLimit({
      kind: "stripe-checkout",
      ipHash: hashDonationSubject(getRequestIp(request)),
      emailHash: hashDonationSubject(email),
      maxPerIp: 10,
      maxPerEmail: 6,
      windowMs: 60 * 60 * 1000,
    });

    const origin = getCanonicalSiteUrl();
    const session = await provider.createDonationSession({
      amount,
      frequency,
      email,
      name,
      successUrl: `${origin}/donate?status=success`,
      cancelUrl: `${origin}/donate?status=cancelled`,
    });

    if (!session.ok || !session.url) {
      console.error("[donation] Stripe Checkout session failed", {
        frequency,
        error: session.error,
      });
      return NextResponse.json(
        { error: "We couldn't start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof DonationRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("[donation] Could not create Stripe Checkout session", error);
    return NextResponse.json(
      { error: "Could not start card checkout." },
      { status: 500 }
    );
  }
}
