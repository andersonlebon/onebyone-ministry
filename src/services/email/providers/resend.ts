import type { EmailMessage, EmailProvider, EmailResult } from "../types";

/**
 * Resend adapter implemented over the REST API (no SDK dependency).
 * Requires RESEND_API_KEY and EMAIL_FROM.
 */
export function createResendProvider(apiKey: string, from: string): EmailProvider {
  return {
    name: "resend",
    async send(message: EmailMessage): Promise<EmailResult> {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from,
            to: Array.isArray(message.to) ? message.to : [message.to],
            subject: message.subject,
            html: message.html,
            text: message.text,
            reply_to: message.replyTo
          })
        });

        if (!res.ok) {
          return { ok: false, error: `Resend responded ${res.status}` };
        }
        const data = (await res.json()) as { id?: string };
        return { ok: true, id: data.id };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  };
}
