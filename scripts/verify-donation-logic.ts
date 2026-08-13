import assert from "node:assert/strict";
import Stripe from "stripe";
import type { User } from "@supabase/supabase-js";

import { monthlyRecurringTotal, totalRaised } from "@/lib/donate/admin-totals";
import { parseDonationAmount } from "@/lib/donate/amount";
import { MAX_DONATION_RECEIPT_BYTES } from "@/lib/donate/receipt-types";
import { venmoPayUrl } from "@/lib/donate/payment-links";
import type { Donation } from "@/lib/site-content/types";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import { constructStripeWebhookEvent } from "@/lib/stripe/webhook";
import { isAdminUser } from "@/lib/supabase/admin";
import {
  bankReceiptFinalizeSchema,
  bankReceiptUploadSchema,
  donationSchema,
} from "@/lib/validation";

assert.equal(parseDonationAmount("25.75"), 25.75);
assert.equal(donationSchema.safeParse({
  amount: 25.75,
  frequency: "one-time",
  name: "Test Donor",
  email: "donor@example.org",
}).success, true);
assert.equal(donationSchema.safeParse({
  amount: 25.755,
  frequency: "one-time",
  name: "Test Donor",
  email: "donor@example.org",
}).success, false);
assert.equal(donationSchema.safeParse({
  amount: 25,
  frequency: "one-time",
  name: "Test Donor",
  email: "not-an-email",
}).success, false);

assert.equal(bankReceiptUploadSchema.safeParse({
  email: "donor@example.org",
  fileName: "receipt.pdf",
  contentType: "application/pdf",
  size: MAX_DONATION_RECEIPT_BYTES,
  company: "",
}).success, true);
assert.equal(bankReceiptUploadSchema.safeParse({
  email: "donor@example.org",
  fileName: "receipt.exe",
  contentType: "application/octet-stream",
  size: 100,
  company: "",
}).success, false);
assert.equal(bankReceiptUploadSchema.safeParse({
  email: "donor@example.org",
  fileName: "receipt.pdf",
  contentType: "application/pdf",
  size: MAX_DONATION_RECEIPT_BYTES + 1,
  company: "",
}).success, false);

assert.equal(bankReceiptFinalizeSchema.safeParse({
  intentId: "ebffcba7-4ce0-42a7-a03e-3328250d9847",
  name: "Test Donor",
  email: "donor@example.org",
  amount: 100.25,
  transferDate: "2026-08-13",
  reference: "WIRE-123",
  notes: "",
  company: "",
}).success, true);
assert.equal(bankReceiptFinalizeSchema.safeParse({
  intentId: "ebffcba7-4ce0-42a7-a03e-3328250d9847",
  name: "Test Donor",
  email: "donor@example.org",
  amount: 100.25,
  transferDate: "2999-01-01",
  reference: "",
  notes: "",
  company: "",
}).success, false);

const venmo = new URL(venmoPayUrl("@onebyone", "25.75", "Donation", "one-time"));
assert.equal(venmo.searchParams.get("amount"), "25.75");
assert.equal(venmo.searchParams.get("note"), "Donation");

const base: Omit<Donation, "id" | "amount" | "status"> = {
  name: "Donor",
  email: "donor@example.org",
  currency: "USD",
  method: "card",
  frequency: "monthly",
  date: "August 13, 2026",
  notes: "",
};
const donations: Donation[] = [
  { ...base, id: "1", amount: 25, status: "completed", stripeSubscriptionId: "sub_1" },
  { ...base, id: "2", amount: 25, status: "completed", stripeSubscriptionId: "sub_1" },
  { ...base, id: "3", amount: 10, status: "pending" },
  { ...base, id: "4", amount: 5, status: "rejected" },
  { ...base, id: "5", amount: 40, status: "approved", frequency: "one-time" },
];
assert.equal(totalRaised(donations), 90);
assert.equal(monthlyRecurringTotal(donations), 25);

const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
process.env.NEXT_PUBLIC_SITE_URL = "https://donations.example.org";
assert.equal(
  getCanonicalSiteUrl("https://attacker.example"),
  "https://donations.example.org"
);
if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;

const stripe = new Stripe("not-a-real-api-key");
const webhookSecret = "test-signing-secret";
const payload = JSON.stringify({
  id: "evt_test",
  object: "event",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test" } },
});
const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
});
assert.equal(
  constructStripeWebhookEvent(
    stripe,
    payload,
    signature,
    `previous-signing-secret,${webhookSecret}`
  ).id,
  "evt_test"
);
assert.throws(() =>
  constructStripeWebhookEvent(stripe, payload, signature, "forged-signing-secret")
);
const oldSignature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
  timestamp: Math.floor(Date.now() / 1000) - 301,
});
assert.throws(() =>
  constructStripeWebhookEvent(stripe, payload, oldSignature, webhookSecret)
);
const staffUser = (role: string) =>
  ({ app_metadata: { role } }) as unknown as User;
assert.equal(isAdminUser(staffUser("viewer")), false);
assert.equal(isAdminUser(staffUser("admin")), true);

console.log("PASS donation validation, URLs, webhook signatures, Venmo, and totals");
