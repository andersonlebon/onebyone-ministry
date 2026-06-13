import type { NewsletterContact, NewsletterProvider, NewsletterResult } from "../types";

/**
 * Brevo (Sendinblue) adapter over the REST API.
 * Requires BREVO_API_KEY and BREVO_LIST_ID.
 */
export function createBrevoProvider(apiKey: string, listId: number): NewsletterProvider {
  return {
    name: "brevo",
    async subscribe(contact: NewsletterContact): Promise<NewsletterResult> {
      try {
        const res = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: { "api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: contact.email,
            attributes: contact.firstName ? { FIRSTNAME: contact.firstName } : undefined,
            listIds: [listId],
            updateEnabled: true
          })
        });
        // 201 created, 204 updated. Brevo returns 400 if already in list (acceptable).
        if (res.ok || res.status === 400) return { ok: true };
        return { ok: false, error: `Brevo responded ${res.status}` };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  };
}
