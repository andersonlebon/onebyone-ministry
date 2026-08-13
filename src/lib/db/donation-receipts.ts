import { and, count, eq, gt, inArray, isNull, lt } from "drizzle-orm";

import type { Donation } from "@/lib/site-content/types";

import { getDb } from "./index";
import {
  donationReceiptUploads,
  donationRequestLog,
  donations,
  type DonationReceiptUpload,
} from "./schema";

export class DonationRateLimitError extends Error {
  constructor() {
    super("Too many requests. Please wait and try again.");
    this.name = "DonationRateLimitError";
  }
}

export async function enforceDonationRateLimit(input: {
  kind: "stripe-checkout" | "bank-receipt-init" | "bank-receipt-finalize";
  ipHash: string;
  emailHash?: string;
  maxPerIp: number;
  maxPerEmail?: number;
  windowMs: number;
}) {
  const db = getDb();
  const since = new Date(Date.now() - input.windowMs);
  await db
    .delete(donationRequestLog)
    .where(lt(donationRequestLog.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

  const [ipResult] = await db
    .select({ value: count() })
    .from(donationRequestLog)
    .where(
      and(
        eq(donationRequestLog.kind, input.kind),
        eq(donationRequestLog.ipHash, input.ipHash),
        gt(donationRequestLog.createdAt, since)
      )
    );

  if (Number(ipResult?.value ?? 0) >= input.maxPerIp) {
    throw new DonationRateLimitError();
  }

  if (input.emailHash && input.maxPerEmail) {
    const [emailResult] = await db
      .select({ value: count() })
      .from(donationRequestLog)
      .where(
        and(
          eq(donationRequestLog.kind, input.kind),
          eq(donationRequestLog.emailHash, input.emailHash),
          gt(donationRequestLog.createdAt, since)
        )
      );
    if (Number(emailResult?.value ?? 0) >= input.maxPerEmail) {
      throw new DonationRateLimitError();
    }
  }

  await db.insert(donationRequestLog).values({
    kind: input.kind,
    ipHash: input.ipHash,
    emailHash: input.emailHash ?? null,
  });
}

export async function createDonationReceiptUploadIntent(input: {
  path: string;
  emailHash: string;
  ipHash: string;
  originalName: string;
  contentType: string;
  size: number;
  expiresAt: Date;
}): Promise<DonationReceiptUpload> {
  const db = getDb();
  const [row] = await db.insert(donationReceiptUploads).values(input).returning();
  if (!row) throw new Error("Could not create receipt upload.");
  return row;
}

export async function getDonationReceiptUploadIntent(
  id: string
): Promise<DonationReceiptUpload | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(donationReceiptUploads)
    .where(eq(donationReceiptUploads.id, id))
    .limit(1);
  return row ?? null;
}

export async function listExpiredDonationReceiptUploads(limit = 25) {
  const db = getDb();
  return db
    .select()
    .from(donationReceiptUploads)
    .where(
      and(
        isNull(donationReceiptUploads.finalizedAt),
        lt(donationReceiptUploads.expiresAt, new Date())
      )
    )
    .limit(limit);
}

export async function deleteDonationReceiptUploadIntents(ids: string[]) {
  if (ids.length === 0) return;
  const db = getDb();
  await db.delete(donationReceiptUploads).where(inArray(donationReceiptUploads.id, ids));
}

/** Atomically consume an upload intent and create its pending bank donation. */
export async function finalizeDonationReceiptUpload(
  intentId: string,
  input: Omit<Donation, "id" | "receiptPath" | "receiptOriginalName" | "receiptContentType" | "receiptSize">
): Promise<Donation> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [intent] = await tx
      .update(donationReceiptUploads)
      .set({ finalizedAt: new Date() })
      .where(
        and(
          eq(donationReceiptUploads.id, intentId),
          isNull(donationReceiptUploads.finalizedAt),
          gt(donationReceiptUploads.expiresAt, new Date())
        )
      )
      .returning();

    if (!intent) throw new Error("This receipt upload has expired or was already submitted.");

    const [row] = await tx
      .insert(donations)
      .values({
        name: input.name,
        email: input.email,
        amount: input.amount,
        currency: input.currency,
        method: "bank",
        status: "pending",
        frequency: "one-time",
        date: input.date,
        notes: input.notes,
        transactionId: input.transactionId ?? null,
        providerEventId: input.providerEventId ?? null,
        stripeSubscriptionId: null,
        receiptPath: intent.path,
        receiptOriginalName: intent.originalName,
        receiptContentType: intent.contentType,
        receiptSize: intent.size,
        transferDate: input.transferDate ?? null,
        transferReference: input.transferReference ?? null,
      })
      .returning();

    if (!row) throw new Error("Could not create pending donation.");

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      amount: row.amount,
      currency: "USD",
      method: "bank",
      status: "pending",
      frequency: "one-time",
      date: row.date,
      notes: row.notes,
      transactionId: row.transactionId ?? undefined,
      receiptPath: row.receiptPath ?? undefined,
      receiptOriginalName: row.receiptOriginalName ?? undefined,
      receiptContentType: row.receiptContentType ?? undefined,
      receiptSize: row.receiptSize ?? undefined,
      transferDate: row.transferDate ?? undefined,
      transferReference: row.transferReference ?? undefined,
    };
  });
}
