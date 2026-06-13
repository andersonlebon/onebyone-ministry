import { z } from "zod";

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

export const donationSchema = z.object({
  amount: z.coerce.number().int().positive().min(1).max(1_000_000),
  frequency: z.enum(["one-time", "monthly"]).default("one-time"),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional()
});

export type DonationInput = z.infer<typeof donationSchema>;
