import type { NewsletterContact, NewsletterProvider, NewsletterResult } from "../types";

/**
 * Mailchimp adapter over the REST API.
 * Requires MAILCHIMP_API_KEY (format: key-usX), MAILCHIMP_LIST_ID.
 * The datacenter prefix (usX) is derived from the API key suffix.
 */
export function createMailchimpProvider(apiKey: string, listId: string): NewsletterProvider {
  const dc = apiKey.split("-")[1] ?? "us1";
  return {
    name: "mailchimp",
    async subscribe(contact: NewsletterContact): Promise<NewsletterResult> {
      try {
        const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email_address: contact.email,
            status: "subscribed",
            merge_fields: contact.firstName ? { FNAME: contact.firstName } : undefined
          })
        });
        // 400 with "Member Exists" is fine for our purposes.
        if (res.ok) return { ok: true };
        if (res.status === 400) {
          const body = (await res.json().catch(() => ({}))) as { title?: string };
          if (body.title === "Member Exists") return { ok: true };
        }
        return { ok: false, error: `Mailchimp responded ${res.status}` };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    }
  };
}
