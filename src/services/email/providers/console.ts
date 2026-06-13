import type { EmailMessage, EmailProvider, EmailResult } from "../types";

/**
 * Development / fallback provider. Logs the email instead of sending it so the
 * app works locally without any provider credentials configured.
 */
export const consoleEmailProvider: EmailProvider = {
  name: "console",
  async send(message: EmailMessage): Promise<EmailResult> {
    console.info("[email:console] Would send email:", {
      to: message.to,
      subject: message.subject,
      replyTo: message.replyTo
    });
    return { ok: true, id: "console-noop" };
  }
};
