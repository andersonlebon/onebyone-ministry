export interface NewsletterContact {
  email: string;
  firstName?: string;
}

export interface NewsletterResult {
  ok: boolean;
  error?: string;
}

export interface NewsletterProvider {
  readonly name: string;
  subscribe(contact: NewsletterContact): Promise<NewsletterResult>;
}
