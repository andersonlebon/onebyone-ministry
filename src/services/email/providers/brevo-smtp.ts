import nodemailer from "nodemailer";

import type { EmailMessage, EmailProvider, EmailResult } from "../types";

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "One By One Ministries", email: from.trim() };
}

/**
 * Brevo SMTP relay. Works reliably on Vercel because it does not use the
 * REST API authorized-IP restriction that blocks rotating serverless egress IPs.
 *
 * Brevo → SMTP & API → SMTP: use login email + SMTP key (not the v3 API key).
 */
export function createBrevoSmtpProvider(user: string, pass: string, from: string): EmailProvider {
  const sender = parseFrom(from);
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  return {
    name: "brevo-smtp",
    async send(message: EmailMessage): Promise<EmailResult> {
      try {
        const to = Array.isArray(message.to) ? message.to : [message.to];
        const info = await transporter.sendMail({
          from: `"${sender.name}" <${sender.email}>`,
          to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          replyTo: message.replyTo,
        });

        return { ok: true, id: info.messageId };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    },
  };
}

export function isBrevoIpRestrictionError(error: string | undefined) {
  return Boolean(
    error &&
      (error.includes("unrecognised IP address") ||
        error.includes("unrecognized IP address") ||
        error.includes("authorised_ips") ||
        error.includes("authorized_ips"))
  );
}
