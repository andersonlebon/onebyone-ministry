CREATE TABLE IF NOT EXISTS "contact_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "visitor_name" text NOT NULL,
  "visitor_email" text NOT NULL,
  "subject" text NOT NULL,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "contact_thread_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "thread_id" uuid NOT NULL REFERENCES "contact_threads"("id") ON DELETE CASCADE,
  "direction" text NOT NULL,
  "body" text NOT NULL,
  "sender_name" text NOT NULL,
  "email_sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "contact_thread_messages_thread_id_idx"
  ON "contact_thread_messages" ("thread_id");

CREATE INDEX IF NOT EXISTS "contact_threads_last_message_at_idx"
  ON "contact_threads" ("last_message_at" DESC);

-- Migrate legacy flat contact_messages into threaded inbox (idempotent).
INSERT INTO "contact_threads" (
  "id",
  "visitor_name",
  "visitor_email",
  "subject",
  "read_at",
  "created_at",
  "last_message_at"
)
SELECT
  "id",
  "name",
  "email",
  "subject",
  "read_at",
  "created_at",
  "created_at"
FROM "contact_messages"
WHERE NOT EXISTS (
  SELECT 1 FROM "contact_threads" t WHERE t."id" = "contact_messages"."id"
);

INSERT INTO "contact_thread_messages" (
  "thread_id",
  "direction",
  "body",
  "sender_name",
  "created_at"
)
SELECT
  "id",
  'inbound',
  "message",
  "name",
  "created_at"
FROM "contact_messages"
WHERE NOT EXISTS (
  SELECT 1
  FROM "contact_thread_messages" m
  WHERE m."thread_id" = "contact_messages"."id"
);
