-- Donations ledger for admin finance tracking
CREATE TABLE IF NOT EXISTS "donations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'USD' NOT NULL,
  "method" text NOT NULL,
  "status" text NOT NULL,
  "frequency" text NOT NULL,
  "date" text NOT NULL,
  "notes" text DEFAULT '' NOT NULL,
  "transaction_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
