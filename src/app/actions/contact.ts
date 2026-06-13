"use server";

import { contactSchema } from "@/lib/validation";
import { getEmailProvider, CONTACT_INBOX } from "@/services/email";

export interface ContactActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function submitContact(input: unknown): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please check the form and try again.", fieldErrors };
  }

  const { company, name, email, subject, message } = parsed.data;

  // Honeypot: silently succeed for bots.
  if (company) return { ok: true, message: "Thank you. Your message has been received." };

  const provider = getEmailProvider();
  const result = await provider.send({
    to: CONTACT_INBOX,
    replyTo: email,
    subject: `[Website Contact] ${subject}`,
    html: `<h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
  });

  if (!result.ok) {
    return {
      ok: false,
      message: "We couldn't send your message right now. Please email contact@onebyoneministries.com directly."
    };
  }

  return { ok: true, message: "Thank you. Your message has been received." };
}
