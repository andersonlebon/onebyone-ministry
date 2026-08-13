import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const mediaFolders = ["photos", "projects", "posts", "videos", "brand", "general"] as const;
export type MediaFolder = (typeof mediaFolders)[number];

/** Custom photo albums (admin-created names for the public gallery). */
export const photoAlbums = pgTable("photo_albums", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PhotoAlbum = typeof photoAlbums.$inferSelect;
export type NewPhotoAlbum = typeof photoAlbums.$inferInsert;

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucket: text("bucket").notNull().default("media"),
  path: text("path").notNull().unique(),
  publicUrl: text("public_url").notNull(),
  alt: text("alt"),
  category: text("category"),
  albumId: uuid("album_id").references(() => photoAlbums.id, { onDelete: "set null" }),
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

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  currency: text("currency").notNull().default("USD"),
  method: text("method").notNull(),
  status: text("status").notNull(),
  frequency: text("frequency").notNull(),
  date: text("date").notNull(),
  notes: text("notes").notNull().default(""),
  transactionId: text("transaction_id"),
  providerEventId: text("provider_event_id"),
  stripeTransactionId: text("stripe_transaction_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  receiptPath: text("receipt_path"),
  receiptOriginalName: text("receipt_original_name"),
  receiptContentType: text("receipt_content_type"),
  receiptSize: integer("receipt_size"),
  transferDate: text("transfer_date"),
  transferReference: text("transfer_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("donations_provider_event_id_unique").on(table.providerEventId),
  uniqueIndex("donations_stripe_transaction_id_unique").on(table.stripeTransactionId),
  uniqueIndex("donations_receipt_path_unique").on(table.receiptPath),
  index("donations_stripe_subscription_id_idx").on(table.stripeSubscriptionId),
]);

export type DonationRow = typeof donations.$inferSelect;
export type NewDonationRow = typeof donations.$inferInsert;

/** Short-lived intent for an anonymous donor's direct upload to private storage. */
export const donationReceiptUploads = pgTable("donation_receipt_uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  path: text("path").notNull().unique(),
  emailHash: text("email_hash").notNull(),
  ipHash: text("ip_hash").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("donation_receipt_uploads_ip_created_idx").on(table.ipHash, table.createdAt),
  index("donation_receipt_uploads_email_created_idx").on(table.emailHash, table.createdAt),
]).enableRLS();

export type DonationReceiptUpload = typeof donationReceiptUploads.$inferSelect;
export type NewDonationReceiptUpload = typeof donationReceiptUploads.$inferInsert;

/** Durable abuse guard for public donation endpoints. Stores only keyed hashes. */
export const donationRequestLog = pgTable("donation_request_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(),
  ipHash: text("ip_hash").notNull(),
  emailHash: text("email_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("donation_request_log_ip_created_idx").on(table.kind, table.ipHash, table.createdAt),
  index("donation_request_log_email_created_idx").on(table.kind, table.emailHash, table.createdAt),
]).enableRLS();
