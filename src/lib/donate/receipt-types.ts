export const DONATION_RECEIPTS_BUCKET = "donation-receipts";
export const MAX_DONATION_RECEIPT_BYTES = 10 * 1024 * 1024;

export const DONATION_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type DonationReceiptType = (typeof DONATION_RECEIPT_TYPES)[number];

export function isDonationReceiptType(value: string): value is DonationReceiptType {
  return (DONATION_RECEIPT_TYPES as readonly string[]).includes(value);
}
