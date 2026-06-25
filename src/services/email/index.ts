import "server-only";

import type { EmailProvider } from "./types";
import { createBrevoEmailProvider } from "./providers/brevo";
import { createBrevoSmtpProvider, isBrevoIpRestrictionError } from "./providers/brevo-smtp";
import { consoleEmailProvider } from "./providers/console";
import { createResendProvider } from "./providers/resend";

export type { EmailMessage, EmailProvider, EmailResult } from "./types";

function createBrevoProvider(from: string): EmailProvider | null {
  const smtpKey = process.env.BREVO_SMTP_KEY?.trim();
  const smtpUser = process.env.BREVO_SMTP_USER?.trim();
  const apiKey = process.env.BREVO_API_KEY?.trim();

  const smtp =
    smtpKey && smtpUser ? createBrevoSmtpProvider(smtpUser, smtpKey, from) : null;
  const api = apiKey ? createBrevoEmailProvider(apiKey, from) : null;

  if (smtp) return smtp;

  if (api) {
    return {
      name: "brevo",
      async send(message) {
        const result = await api.send(message);
        if (!result.ok && isBrevoIpRestrictionError(result.error)) {
          return {
            ok: false,
            error:
              "Brevo blocked Vercel's IP via the REST API. Add BREVO_SMTP_USER and BREVO_SMTP_KEY in Vercel (Brevo → SMTP & API → SMTP), or disable Authorized IPs in Brevo.",
          };
        }
        return result;
      },
    };
  }

  return null;
}

/**
 * Returns the configured email provider. Selection is driven by env so the
 * provider can change without touching call sites:
 *   EMAIL_PROVIDER=brevo | resend | console (default: console when unconfigured)
 */
export function getEmailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase();
  const from = process.env.EMAIL_FROM;

  if (provider === "brevo") {
    const brevo = from ? createBrevoProvider(from) : null;
    if (brevo) return brevo;
    console.warn(
      "[email] EMAIL_PROVIDER=brevo but Brevo is not configured. Set BREVO_SMTP_USER + BREVO_SMTP_KEY (recommended on Vercel) or BREVO_API_KEY + EMAIL_FROM."
    );
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && from) return createResendProvider(apiKey, from);
    console.warn("[email] EMAIL_PROVIDER=resend but RESEND_API_KEY/EMAIL_FROM missing; using console provider.");
  }

  return consoleEmailProvider;
}

export const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "contact@onebyoneministries.org";
