import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mediaFolders = ["photos", "projects", "posts", "videos", "brand", "general"] as const;
export type MediaFolder = (typeof mediaFolders)[number];

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucket: text("bucket").notNull().default("media"),
  path: text("path").notNull().unique(),
  publicUrl: text("public_url").notNull(),
  alt: text("alt"),
  category: text("category"),
  folder: text("folder").notNull().default("photos"),
  uploadedBy: uuid("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

/** One-time launch flag: row exists after /setup completes. */
export const projectSetup = pgTable("project_setup", {
  id: text("id").primaryKey(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  superAdminEmail: text("super_admin_email").notNull(),
  superAdminUserId: uuid("super_admin_user_id"),
});

export type ProjectSetup = typeof projectSetup.$inferSelect;

/** Keyed JSON blobs for site content (posts, projects, settings, etc.). */
export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
