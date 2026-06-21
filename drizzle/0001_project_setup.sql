-- project_setup + site_content tables for one-time /setup launch

CREATE TABLE IF NOT EXISTS "project_setup" (
  "id" text PRIMARY KEY NOT NULL,
  "completed_at" timestamp with time zone NOT NULL,
  "super_admin_email" text NOT NULL,
  "super_admin_user_id" uuid
);

CREATE TABLE IF NOT EXISTS "site_content" (
  "key" text PRIMARY KEY NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
