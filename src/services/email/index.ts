import "server-only";

import type { EmailProvider } from "./types";
import { createBrevoEmailProvider } from "./providers/brevo";
import { consoleEmailProvider } from "./providers/console";
import { createResendProvider } from "./providers/resend";

export type { EmailMessage, EmailProvider, EmailResult } from "./types";

/**
 * Returns the configured email provider. Selection is driven by env so the
 * provider can change without touching call sites:
 *   EMAIL_PROVIDER=brevo | resend | console (default: console when unconfigured)
 */
export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase();
  const from = process.env.EMAIL_FROM;

  if (provider === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey && from) return createBrevoEmailProvider(apiKey, from);
    console.warn("[email] EMAIL_PROVIDER=brevo but BREVO_API_KEY/EMAIL_FROM missing; using console provider.");
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && from) return createResendProvider(apiKey, from);
    console.warn("[email] EMAIL_PROVIDER=resend but RESEND_API_KEY/EMAIL_FROM missing; using console provider.");
  }

  return consoleEmailProvider;
}

export const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "contact@onebyoneministries.org";
