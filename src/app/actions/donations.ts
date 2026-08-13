"use server";

import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/config";
import {
  clearDonationReceiptMetadata,
  createDonation,
  deleteDonationRow,
  getDonationById,
  listDonations,
  replaceAllDonations,
  updateDonationRow,
} from "@/lib/db/donations";
import type { Donation } from "@/lib/site-content/types";
import { isAdminUser, isStaffUser } from "@/lib/supabase/admin";
import {
  createDonationReceiptDownloadUrl,
  deleteDonationReceipt,
} from "@/lib/supabase/donation-receipts";
import { createClient } from "@/lib/supabase/server";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user) || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function requireStaffUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isStaffUser(user) || !user) throw new Error("Unauthorized");
  return user;
}

function revalidateDonations() {
  revalidatePath("/admin/donations");
  revalidatePath("/admin/analytics");
}

export async function listDonationsAction(): Promise<Donation[]> {
  if (!isDatabaseConfigured()) return [];
  await requireStaffUser();
  return listDonations();
}

export async function createDonationAction(input: Omit<Donation, "id">): Promise<Donation> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const row = await createDonation(input);
  revalidateDonations();
  return row;
}

export async function updateDonationAction(id: string, input: Partial<Omit<Donation, "id">>): Promise<Donation> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const existing = input.status === "rejected" ? await getDonationById(id) : null;
  if (existing?.receiptPath) {
    await deleteDonationReceipt(existing.receiptPath);
    await clearDonationReceiptMetadata(id);
  }
  const row = await updateDonationRow(id, input);
  revalidateDonations();
  return row;
}

export async function deleteDonationAction(id: string): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const existing = await getDonationById(id);
  if (existing?.receiptPath) {
    await deleteDonationReceipt(existing.receiptPath);
  }
  await deleteDonationRow(id);
  revalidateDonations();
}

export async function getDonationReceiptUrlAction(id: string): Promise<string> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const donation = await getDonationById(id);
  if (!donation?.receiptPath) throw new Error("This donation has no receipt proof.");
  return createDonationReceiptDownloadUrl(
    donation.receiptPath,
    donation.receiptOriginalName
  );
}

export async function replaceDonationsAction(items: Donation[]): Promise<Donation[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const rows = await replaceAllDonations(items);
  revalidateDonations();
  return rows;
}
