ALTER TABLE "donations"
  ALTER COLUMN "amount" TYPE numeric(12, 2)
  USING "amount"::numeric(12, 2);

ALTER TABLE "donations"
  ADD COLUMN IF NOT EXISTS "provider_event_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_transaction_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text,
  ADD COLUMN IF NOT EXISTS "receipt_path" text,
  ADD COLUMN IF NOT EXISTS "receipt_original_name" text,
  ADD COLUMN IF NOT EXISTS "receipt_content_type" text,
  ADD COLUMN IF NOT EXISTS "receipt_size" integer,
  ADD COLUMN IF NOT EXISTS "transfer_date" text,
  ADD COLUMN IF NOT EXISTS "transfer_reference" text;

CREATE UNIQUE INDEX IF NOT EXISTS "donations_provider_event_id_unique"
  ON "donations" ("provider_event_id");
CREATE UNIQUE INDEX IF NOT EXISTS "donations_stripe_transaction_id_unique"
  ON "donations" ("stripe_transaction_id");
CREATE UNIQUE INDEX IF NOT EXISTS "donations_receipt_path_unique"
  ON "donations" ("receipt_path");
CREATE INDEX IF NOT EXISTS "donations_stripe_subscription_id_idx"
  ON "donations" ("stripe_subscription_id");

CREATE TABLE IF NOT EXISTS "donation_receipt_uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "path" text NOT NULL UNIQUE,
  "email_hash" text NOT NULL,
  "ip_hash" text NOT NULL,
  "original_name" text NOT NULL,
  "content_type" text NOT NULL,
  "size" integer NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "finalized_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "donation_receipt_uploads_ip_created_idx"
  ON "donation_receipt_uploads" ("ip_hash", "created_at");
CREATE INDEX IF NOT EXISTS "donation_receipt_uploads_email_created_idx"
  ON "donation_receipt_uploads" ("email_hash", "created_at");

CREATE TABLE IF NOT EXISTS "donation_request_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kind" text NOT NULL,
  "ip_hash" text NOT NULL,
  "email_hash" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "donation_request_log_ip_created_idx"
  ON "donation_request_log" ("kind", "ip_hash", "created_at");
CREATE INDEX IF NOT EXISTS "donation_request_log_email_created_idx"
  ON "donation_request_log" ("kind", "email_hash", "created_at");

ALTER TABLE "donation_receipt_uploads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donation_request_log" ENABLE ROW LEVEL SECURITY;
