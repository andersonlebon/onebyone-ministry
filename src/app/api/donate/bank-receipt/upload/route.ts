import { NextResponse } from "next/server";

import {
  createDonationReceiptUploadIntent,
  deleteDonationReceiptUploadIntents,
  DonationRateLimitError,
  enforceDonationRateLimit,
  listExpiredDonationReceiptUploads,
} from "@/lib/db/donation-receipts";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getRequestIp, hashDonationSubject } from "@/lib/donate/request-security";
import {
  createDonationReceiptPath,
  createDonationReceiptUploadTarget,
  deleteDonationReceipt,
} from "@/lib/supabase/donation-receipts";
import { isServiceRoleConfigured } from "@/lib/supabase/service";
import { bankReceiptUploadSchema } from "@/lib/validation";

export const runtime = "nodejs";

function safeFilename(value: string) {
  return value
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, 180) || "receipt";
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Bank receipt uploads are not configured." }, { status: 503 });
  }

  const parsed = bankReceiptUploadSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a JPEG, PNG, or PDF receipt no larger than 10 MB." },
      { status: 400 }
    );
  }

  const { email, contentType, size } = parsed.data;
  const originalName = safeFilename(parsed.data.fileName);
  const ipHash = hashDonationSubject(getRequestIp(request));
  const emailHash = hashDonationSubject(email);

  try {
    const expired = await listExpiredDonationReceiptUploads();
    if (expired.length > 0) {
      await Promise.all(expired.map((item) => deleteDonationReceipt(item.path).catch(() => undefined)));
      await deleteDonationReceiptUploadIntents(expired.map((item) => item.id));
    }

    await enforceDonationRateLimit({
      kind: "bank-receipt-init",
      ipHash,
      emailHash,
      maxPerIp: 5,
      maxPerEmail: 3,
      windowMs: 60 * 60 * 1000,
    });

    const path = createDonationReceiptPath(contentType);
    const target = await createDonationReceiptUploadTarget(path);
    const intent = await createDonationReceiptUploadIntent({
      path,
      emailHash,
      ipHash,
      originalName,
      contentType,
      size,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return NextResponse.json({
      intentId: intent.id,
      path: target.path,
      token: target.token,
    });
  } catch (error) {
    if (error instanceof DonationRateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("[donation] Could not initialize bank receipt upload", error);
    return NextResponse.json({ error: "Could not prepare receipt upload." }, { status: 500 });
  }
}
