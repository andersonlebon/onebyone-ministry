import { desc, eq } from "drizzle-orm";

import type { Donation } from "@/lib/site-content/types";

import { getDb } from "./index";
import { donations, type DonationRow } from "./schema";

function rowToDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    amount: row.amount,
    currency: "USD",
    method: row.method as Donation["method"],
    status: row.status as Donation["status"],
    frequency: row.frequency as Donation["frequency"],
    date: row.date,
    notes: row.notes,
    transactionId: row.transactionId ?? undefined,
  };
}

export async function listDonations(): Promise<Donation[]> {
  const db = getDb();
  const rows = await db.select().from(donations).orderBy(desc(donations.createdAt));
  return rows.map(rowToDonation);
}

export async function createDonation(input: Omit<Donation, "id">): Promise<Donation> {
  const db = getDb();
  const [row] = await db
    .insert(donations)
    .values({
      name: input.name,
      email: input.email,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      status: input.status,
      frequency: input.frequency,
      date: input.date,
      notes: input.notes,
      transactionId: input.transactionId ?? null,
    })
    .returning();

  if (!row) throw new Error("Failed to create donation");
  return rowToDonation(row);
}

export async function updateDonationRow(id: string, input: Partial<Omit<Donation, "id">>): Promise<Donation> {
  const db = getDb();
  const [row] = await db
    .update(donations)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.method !== undefined ? { method: input.method } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.frequency !== undefined ? { frequency: input.frequency } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.transactionId !== undefined ? { transactionId: input.transactionId ?? null } : {}),
    })
    .where(eq(donations.id, id))
    .returning();

  if (!row) throw new Error("Donation not found");
  return rowToDonation(row);
}

export async function deleteDonationRow(id: string): Promise<void> {
  const db = getDb();
  await db.delete(donations).where(eq(donations.id, id));
}

export async function replaceAllDonations(items: Donation[]): Promise<Donation[]> {
  const db = getDb();
  await db.delete(donations);

  if (items.length === 0) return [];

  const rows = await db
    .insert(donations)
    .values(
      items.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        amount: item.amount,
        currency: item.currency,
        method: item.method,
        status: item.status,
        frequency: item.frequency,
        date: item.date,
        notes: item.notes,
        transactionId: item.transactionId ?? null,
      }))
    )
    .returning();

  return rows.map(rowToDonation);
}
