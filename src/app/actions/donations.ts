"use server";

import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/config";
import {
  createDonation,
  deleteDonationRow,
  listDonations,
  replaceAllDonations,
  updateDonationRow,
} from "@/lib/db/donations";
import type { Donation } from "@/lib/site-content/types";
import { isAdminUser } from "@/lib/supabase/admin";
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

function revalidateDonations() {
  revalidatePath("/admin/donations");
  revalidatePath("/admin/analytics");
}

export async function listDonationsAction(): Promise<Donation[]> {
  if (!isDatabaseConfigured()) return [];
  await requireAdminUser();
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
  const row = await updateDonationRow(id, input);
  revalidateDonations();
  return row;
}

export async function deleteDonationAction(id: string): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  await deleteDonationRow(id);
  revalidateDonations();
}

export async function replaceDonationsAction(items: Donation[]): Promise<Donation[]> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  await requireAdminUser();
  const rows = await replaceAllDonations(items);
  revalidateDonations();
  return rows;
}
