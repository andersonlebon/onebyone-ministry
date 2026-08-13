import { z } from "zod";

import {
  DONATION_RECEIPT_TYPES,
  MAX_DONATION_RECEIPT_BYTES,
} from "@/lib/donate/receipt-types";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  subject: z.string().trim().min(2, "Please add a subject.").max(160),
  message: z.string().trim().min(10, "Please write at least a few words.").max(5000),
  // Honeypot — must stay empty for real humans.
  company: z.string().optional()
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name.").max(80),
  email: z.string().trim().email("Please enter a valid email address."),
  company: z.string().optional()
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

const donationAmountSchema = z.coerce
  .number()
  .positive()
  .min(1)
  .max(1_000_000)
  .refine(
    (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-8,
    "Donation amount may have at most two decimal places."
  );

export const donationSchema = z.object({
  amount: donationAmountSchema,
  frequency: z.enum(["one-time", "monthly"]).default("one-time"),
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Valid email is required."),
});

export type DonationInput = z.infer<typeof donationSchema>;

export const bankReceiptUploadSchema = z.object({
  email: z.string().trim().email("Valid email is required."),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(DONATION_RECEIPT_TYPES),
  size: z.coerce.number().int().positive().max(MAX_DONATION_RECEIPT_BYTES),
  company: z.string().max(0).optional(),
});

export const bankReceiptFinalizeSchema = z.object({
  intentId: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Valid email is required."),
  amount: donationAmountSchema,
  transferDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Transfer date is required.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value &&
        date.getTime() <= Date.now()
      );
    }, "Transfer date must be a valid date that is not in the future."),
  reference: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
  company: z.string().max(0).optional(),
});

export type BankReceiptUploadInput = z.infer<typeof bankReceiptUploadSchema>;
export type BankReceiptFinalizeInput = z.infer<typeof bankReceiptFinalizeSchema>;
