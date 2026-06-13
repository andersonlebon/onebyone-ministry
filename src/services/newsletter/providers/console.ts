import type { NewsletterContact, NewsletterProvider, NewsletterResult } from "../types";

export const consoleNewsletterProvider: NewsletterProvider = {
  name: "console",
  async subscribe(contact: NewsletterContact): Promise<NewsletterResult> {
    console.info("[newsletter:console] Would subscribe:", contact);
    return { ok: true };
  }
};
