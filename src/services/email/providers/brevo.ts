import type { EmailMessage, EmailProvider, EmailResult } from "../types";

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "One By One Ministries", email: from.trim() };
}

/**
 * Brevo transactional email adapter (SMTP API).
 * Requires BREVO_API_KEY and EMAIL_FROM.
 */
export function createBrevoEmailProvider(apiKey: string, from: string): EmailProvider {
  const sender = parseFrom(from);

  return {
    name: "brevo",
    async send(message: EmailMessage): Promise<EmailResult> {
      try {
        const to = Array.isArray(message.to) ? message.to : [message.to];
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender,
            to: to.map((email) => ({ email })),
            subject: message.subject,
            htmlContent: message.html,
            textContent: message.text,
            replyTo: message.replyTo ? { email: message.replyTo } : undefined,
          }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          return { ok: false, error: `Brevo responded ${res.status}${body ? `: ${body}` : ""}` };
        }

        const data = (await res.json()) as { messageId?: string };
        return { ok: true, id: data.messageId };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
  };
}
