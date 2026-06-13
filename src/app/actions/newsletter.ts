"use server";

import { newsletterSchema } from "@/lib/validation";
import { getNewsletterProvider } from "@/services/newsletter";

export interface NewsletterActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function subscribeToNewsletter(input: unknown): Promise<NewsletterActionState> {
  const parsed = newsletterSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please check your details and try again.", fieldErrors };
  }

  const { company, firstName, email } = parsed.data;

  // Honeypot.
  if (company) return { ok: true, message: "Thank you for subscribing!" };

  const provider = getNewsletterProvider();
  const result = await provider.subscribe({ email, firstName });

  if (!result.ok) {
    return { ok: false, message: "We couldn't subscribe you right now. Please try again later." };
  }

  return { ok: true, message: "Thank you for subscribing!" };
}
