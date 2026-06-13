export interface DonationParams {
  /** Whole-dollar amount (USD). */
  amount: number;
  frequency: "one-time" | "monthly";
  successUrl: string;
  cancelUrl: string;
  email?: string;
  name?: string;
}

export interface DonationSession {
  ok: boolean;
  url?: string;
  error?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createDonationSession(params: DonationParams): Promise<DonationSession>;
}
