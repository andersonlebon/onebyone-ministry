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

/** Legacy flat contact form rows (migrated into contact_threads). */
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

/** Inbox conversation thread (one per contact form submission). */
export const contactThreads = pgTable("contact_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),
  subject: text("subject").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactThread = typeof contactThreads.$inferSelect;
export type NewContactThread = typeof contactThreads.$inferInsert;

export const contactThreadMessageDirections = ["inbound", "outbound"] as const;
export type ContactThreadMessageDirection = (typeof contactThreadMessageDirections)[number];

/** Individual message within a contact thread. */
export const contactThreadMessages = pgTable("contact_thread_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => contactThreads.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  body: text("body").notNull(),
  senderName: text("sender_name").notNull(),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ContactThreadMessage = typeof contactThreadMessages.$inferSelect;
export type NewContactThreadMessage = typeof contactThreadMessages.$inferInsert;
