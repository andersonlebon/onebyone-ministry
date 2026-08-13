import "server-only";

import crypto from "node:crypto";

function getHashSecret() {
  const secret =
    process.env.DONATION_RATE_LIMIT_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) {
    throw new Error("Donation request protection is not configured.");
  }
  return secret;
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashDonationSubject(value: string) {
  return crypto
    .createHmac("sha256", getHashSecret())
    .update(value.trim().toLowerCase(), "utf8")
    .digest("hex");
}
