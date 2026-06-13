import { NextResponse } from "next/server";

import { donationSchema } from "@/lib/validation";
import { getPaymentProvider } from "@/services/payments";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = donationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid donation amount." },
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

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const { amount, frequency, email, name } = parsed.data;

  const session = await provider.createDonationSession({
    amount,
    frequency,
    email,
    name,
    successUrl: `${origin}/donate?status=success`,
    cancelUrl: `${origin}/donate?status=cancelled`
  });

  if (!session.ok || !session.url) {
    return NextResponse.json(
      { error: session.error ?? "We couldn't start checkout. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
