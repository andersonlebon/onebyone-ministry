import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  DonationRateLimitError,
  enforceDonationRateLimit,
  finalizeDonationReceiptUpload,
  getDonationReceiptUploadIntent,
} from "@/lib/db/donation-receipts";
import {
  getRequestIp,
  hashDonationSubject,
} from "@/lib/donate/request-security";
import {
  deleteDonationReceipt,
  isDonationReceiptType,
  validateDonationReceiptObject,
} from "@/lib/supabase/donation-receipts";
import { bankReceiptFinalizeSchema } from "@/lib/validation";

export const runtime = "nodejs";

function displayDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function POST(request: Request) {
  const parsed = bankReceiptFinalizeSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid receipt submission." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const intent = await getDonationReceiptUploadIntent(input.intentId);
  if (
    !intent ||
    intent.finalizedAt ||
    intent.expiresAt.getTime() <= Date.now() ||
    intent.emailHash !== hashDonationSubject(input.email) ||
    !isDonationReceiptType(intent.contentType)
  ) {
    return NextResponse.json(
      { error: "This receipt upload has expired. Please choose the file again." },
      { status: 409 }
    );
  }

  try {
    await enforceDonationRateLimit({
      kind: "bank-receipt-finalize",
      ipHash: hashDonationSubject(getRequestIp(request)),
      emailHash: intent.emailHash,
      maxPerIp: 10,
      maxPerEmail: 5,
      windowMs: 60 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof DonationRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("[donation] Could not enforce receipt rate limit", error);
    return NextResponse.json({ error: "Could not submit receipt proof." }, { status: 500 });
  }

  try {
    await validateDonationReceiptObject(intent.path, intent.contentType, intent.size);
  } catch (error) {
    console.warn("[donation] Rejected invalid receipt upload", {
      intentId: intent.id,
      error: error instanceof Error ? error.message : "Unknown validation error",
    });
    await deleteDonationReceipt(intent.path).catch(() => undefined);
    return NextResponse.json(
      { error: "The uploaded receipt could not be verified. Please upload it again." },
      { status: 400 }
    );
  }

  try {
    const donation = await finalizeDonationReceiptUpload(intent.id, {
      name: input.name,
      email: input.email,
      amount: input.amount,
      currency: "USD",
      method: "bank",
      status: "pending",
      frequency: "one-time",
      date: displayDate(input.transferDate),
      notes: input.notes,
      transactionId: input.reference || undefined,
      providerEventId: `bank-receipt:${intent.id}`,
      transferDate: input.transferDate,
      transferReference: input.reference || undefined,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ ok: true, donationId: donation.id });
  } catch (error) {
    console.error("[donation] Could not finalize bank receipt", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit receipt proof." },
      { status: 500 }
    );
  }
}
