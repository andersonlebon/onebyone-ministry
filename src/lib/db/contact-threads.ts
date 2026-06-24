import { desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "./index";
import {
  contactThreadMessages,
  contactThreads,
  type ContactThread,
  type ContactThreadMessage,
  type ContactThreadMessageDirection,
} from "./schema";

export type ContactThreadListItem = ContactThread & {
  lastMessagePreview: string | null;
};

export async function createContactThreadWithMessage(input: {
  visitorName: string;
  visitorEmail: string;
  subject: string;
  body: string;
}): Promise<{ thread: ContactThread; message: ContactThreadMessage }> {
  const db = getDb();
  const now = new Date();

  const [thread] = await db
    .insert(contactThreads)
    .values({
      visitorName: input.visitorName,
      visitorEmail: input.visitorEmail,
      subject: input.subject,
      lastMessageAt: now,
    })
    .returning();

  if (!thread) {
    throw new Error("Failed to create contact thread");
  }

  const [message] = await db
    .insert(contactThreadMessages)
    .values({
      threadId: thread.id,
      direction: "inbound",
      body: input.body,
      senderName: input.visitorName,
    })
    .returning();

  if (!message) {
    throw new Error("Failed to create contact thread message");
  }

  return { thread, message };
}

export async function listContactThreads(): Promise<ContactThreadListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: contactThreads.id,
      visitorName: contactThreads.visitorName,
      visitorEmail: contactThreads.visitorEmail,
      subject: contactThreads.subject,
      readAt: contactThreads.readAt,
      createdAt: contactThreads.createdAt,
      lastMessageAt: contactThreads.lastMessageAt,
      lastMessagePreview: sql<string | null>`(
        SELECT ${contactThreadMessages.body}
        FROM ${contactThreadMessages}
        WHERE ${contactThreadMessages.threadId} = ${contactThreads.id}
        ORDER BY ${contactThreadMessages.createdAt} DESC
        LIMIT 1
      )`,
    })
    .from(contactThreads)
    .orderBy(desc(contactThreads.lastMessageAt));

  return rows;
}

export async function getContactThreadById(id: string): Promise<ContactThread | undefined> {
  const db = getDb();
  const [row] = await db.select().from(contactThreads).where(eq(contactThreads.id, id)).limit(1);
  return row;
}

export async function getThreadWithMessages(
  threadId: string,
): Promise<{ thread: ContactThread; messages: ContactThreadMessage[] } | null> {
  const db = getDb();
  const thread = await getContactThreadById(threadId);
  if (!thread) return null;

  const messages = await db
    .select()
    .from(contactThreadMessages)
    .where(eq(contactThreadMessages.threadId, threadId))
    .orderBy(contactThreadMessages.createdAt);

  return { thread, messages };
}

export async function createOutboundThreadMessage(input: {
  threadId: string;
  body: string;
  senderName: string;
}): Promise<ContactThreadMessage> {
  const db = getDb();
  const now = new Date();

  const [message] = await db
    .insert(contactThreadMessages)
    .values({
      threadId: input.threadId,
      direction: "outbound" satisfies ContactThreadMessageDirection,
      body: input.body,
      senderName: input.senderName,
    })
    .returning();

  if (!message) {
    throw new Error("Failed to save reply");
  }

  await db
    .update(contactThreads)
    .set({ lastMessageAt: now })
    .where(eq(contactThreads.id, input.threadId));

  return message;
}

export async function markThreadMessageEmailSent(messageId: string): Promise<ContactThreadMessage> {
  const db = getDb();
  const [row] = await db
    .update(contactThreadMessages)
    .set({ emailSentAt: new Date() })
    .where(eq(contactThreadMessages.id, messageId))
    .returning();

  if (!row) {
    throw new Error("Thread message not found");
  }

  return row;
}

export async function countUnreadContactThreads(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactThreads)
    .where(isNull(contactThreads.readAt));

  return row?.count ?? 0;
}

export async function markContactThreadRead(id: string): Promise<ContactThread> {
  const db = getDb();
  const [row] = await db
    .update(contactThreads)
    .set({ readAt: new Date() })
    .where(eq(contactThreads.id, id))
    .returning();

  if (!row) {
    throw new Error("Contact thread not found");
  }

  return row;
}

export async function markContactThreadUnread(id: string): Promise<ContactThread> {
  const db = getDb();
  const [row] = await db
    .update(contactThreads)
    .set({ readAt: null })
    .where(eq(contactThreads.id, id))
    .returning();

  if (!row) {
    throw new Error("Contact thread not found");
  }

  return row;
}

export async function markAllContactThreadsRead(): Promise<number> {
  const db = getDb();
  const rows = await db
    .update(contactThreads)
    .set({ readAt: new Date() })
    .where(isNull(contactThreads.readAt))
    .returning({ id: contactThreads.id });

  return rows.length;
}
