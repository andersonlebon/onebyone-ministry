-- Drizzle schema: media_assets
-- Apply with `npm run db:push` or `npm run db:migrate` after setting DATABASE_URL.
-- RLS and Storage policies remain in supabase/migrations/20250620120000_init_auth_and_media.sql

CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "bucket" text DEFAULT 'media' NOT NULL,
  "path" text NOT NULL,
  "public_url" text NOT NULL,
  "alt" text,
  "category" text,
  "folder" text DEFAULT 'photos' NOT NULL,
  "uploaded_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "media_assets_path_unique" UNIQUE("path")
);

CREATE INDEX IF NOT EXISTS "media_assets_folder_created_idx"
  ON "media_assets" ("folder", "created_at" DESC);
