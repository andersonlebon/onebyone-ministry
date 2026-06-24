"use server";

import { contactSchema } from "@/lib/validation";
import { isDatabaseConfigured } from "@/lib/db/config";
import { createContactThreadWithMessage } from "@/lib/db/contact-threads";
import { getEmailProvider, CONTACT_INBOX } from "@/services/email";
import {
  contactConfirmationEmail,
  contactStaffNotificationEmail,
} from "@/services/email/templates";

export interface ContactActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
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

  let savedThreadId: string | undefined;

  if (isDatabaseConfigured()) {
    try {
      const { thread } = await createContactThreadWithMessage({
        visitorName: name,
        visitorEmail: email,
        subject,
        body: message,
      });
      savedThreadId = thread.id;
    } catch (error) {
      console.error("[contact] Failed to save message:", error);
      return {
        ok: false,
        message: "We couldn't save your message right now. Please try again or email contact@onebyoneministries.org directly.",
      };
    }
  }

  const provider = getEmailProvider();
  const staffEmail = contactStaffNotificationEmail({
    name,
    email,
    subject,
    message,
    messageId: savedThreadId,
  });

  const staffResult = await provider.send({
    to: CONTACT_INBOX,
    replyTo: email,
    subject: staffEmail.subject,
    html: staffEmail.html,
    text: staffEmail.text,
  });

  if (!staffResult.ok) {
    console.error("[contact] Staff notification failed:", staffResult.error);
    if (!savedThreadId) {
      return {
        ok: false,
        message: "We couldn't send your message right now. Please email contact@onebyoneministries.org directly.",
      };
    }
  }

  const confirmation = contactConfirmationEmail(name);
  const confirmResult = await provider.send({
    to: email,
    subject: confirmation.subject,
    html: confirmation.html,
    text: confirmation.text,
  });

  if (!confirmResult.ok) {
    console.error("[contact] Visitor confirmation failed:", confirmResult.error);
  }

  return { ok: true, message: "Thank you. Your message has been received." };
}
