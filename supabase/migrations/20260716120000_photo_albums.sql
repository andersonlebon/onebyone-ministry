-- Additive only: custom photo albums + optional album link on media_assets.
-- Safe for production; does not delete existing photos or content.

CREATE TABLE IF NOT EXISTS photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS album_id uuid;

DO $$ BEGIN
  ALTER TABLE media_assets
    ADD CONSTRAINT media_assets_album_id_photo_albums_id_fk
    FOREIGN KEY (album_id) REFERENCES photo_albums(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
