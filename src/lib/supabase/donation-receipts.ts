import "server-only";

import { randomUUID } from "node:crypto";

import {
  DONATION_RECEIPTS_BUCKET,
  isDonationReceiptType,
  MAX_DONATION_RECEIPT_BYTES,
  type DonationReceiptType,
} from "@/lib/donate/receipt-types";

import { createServiceClient } from "./service";

export { isDonationReceiptType };

function extensionFor(contentType: DonationReceiptType) {
  if (contentType === "application/pdf") return "pdf";
  if (contentType === "image/png") return "png";
  return "jpg";
}

export function createDonationReceiptPath(contentType: DonationReceiptType) {
  const id = randomUUID();
  return `${new Date().getUTCFullYear()}/${id}.${extensionFor(contentType)}`;
}

export async function createDonationReceiptUploadTarget(path: string) {
  const service = createServiceClient();
  const { data, error } = await service.storage
    .from(DONATION_RECEIPTS_BUCKET)
    .createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.token) {
    throw error ?? new Error("Could not create receipt upload target.");
  }
  return { path, token: data.token };
}

export async function donationReceiptExists(path: string) {
  const service = createServiceClient();
  const slash = path.lastIndexOf("/");
  const folder = slash >= 0 ? path.slice(0, slash) : "";
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const { data, error } = await service.storage
    .from(DONATION_RECEIPTS_BUCKET)
    .list(folder, { search: name, limit: 10 });
  if (error) throw error;
  return Boolean(data?.some((item) => item.name === name));
}

function hasExpectedMagic(bytes: Uint8Array, contentType: DonationReceiptType) {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
}

export async function validateDonationReceiptObject(
  path: string,
  contentType: DonationReceiptType,
  expectedSize: number
) {
  const service = createServiceClient();
  const { data, error } = await service.storage.from(DONATION_RECEIPTS_BUCKET).download(path);
  if (error || !data) throw error ?? new Error("Receipt upload was not found.");
  if (
    data.size <= 0 ||
    data.size > MAX_DONATION_RECEIPT_BYTES ||
    data.size !== expectedSize
  ) {
    throw new Error("Receipt file size does not match the upload request.");
  }
  const bytes = new Uint8Array(await data.slice(0, 16).arrayBuffer());
  if (!hasExpectedMagic(bytes, contentType)) {
    throw new Error("Receipt file content does not match its file type.");
  }
}

export async function createDonationReceiptDownloadUrl(path: string, filename?: string) {
  const service = createServiceClient();
  const { data, error } = await service.storage
    .from(DONATION_RECEIPTS_BUCKET)
    .createSignedUrl(path, 5 * 60, filename ? { download: filename } : undefined);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Could not open receipt proof.");
  }
  return data.signedUrl;
}

export async function deleteDonationReceipt(path: string | null | undefined) {
  if (!path) return;
  const service = createServiceClient();
  const { error } = await service.storage.from(DONATION_RECEIPTS_BUCKET).remove([path]);
  if (error) throw error;
}
