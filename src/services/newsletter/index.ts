import "server-only";

import type { NewsletterProvider } from "./types";
import { consoleNewsletterProvider } from "./providers/console";
import { createBrevoProvider } from "./providers/brevo";
import { createMailchimpProvider } from "./providers/mailchimp";

export type { NewsletterContact, NewsletterProvider, NewsletterResult } from "./types";

/**
 * Returns the configured newsletter provider, selected via:
 *   NEWSLETTER_PROVIDER=brevo | mailchimp | console (default: console)
 */
export function getNewsletterProvider(): NewsletterProvider {
  const provider = (process.env.NEWSLETTER_PROVIDER ?? "").toLowerCase();

  if (provider === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_LIST_ID);
    if (apiKey && listId) return createBrevoProvider(apiKey, listId);
    console.warn("[newsletter] BREVO_* env missing; using console provider.");
  }

  if (provider === "mailchimp") {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    if (apiKey && listId) return createMailchimpProvider(apiKey, listId);
    console.warn("[newsletter] MAILCHIMP_* env missing; using console provider.");
  }

  return consoleNewsletterProvider;
}
