"use server";

import {
  countUnreadContactThreads,
  createOutboundThreadMessage,
  getThreadWithMessages,
  listContactThreads,
  markAllContactThreadsRead,
  markContactThreadRead,
  markContactThreadUnread,
  markThreadMessageEmailSent,
  type ContactThreadListItem,
} from "@/lib/db/contact-threads";
import { isDatabaseConfigured } from "@/lib/db/config";
import type { ContactThread, ContactThreadMessage } from "@/lib/db/schema";
import { isAdminUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getEmailProvider, CONTACT_INBOX } from "@/services/email";
import { threadReplyEmail } from "@/services/email/templates";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminUser(user) || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function assertDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured");
  }
}

export async function listThreadsAction(): Promise<ContactThreadListItem[]> {
  assertDatabase();
  await requireAdminUser();
  return listContactThreads();
}

export async function getThreadWithMessagesAction(
  threadId: string,
): Promise<{ thread: ContactThread; messages: ContactThreadMessage[] } | null> {
  assertDatabase();
  await requireAdminUser();
  return getThreadWithMessages(threadId);
}

export async function getUnreadCountAction(): Promise<number> {
  if (!isDatabaseConfigured()) return 0;

  try {
    await requireAdminUser();
    return countUnreadContactThreads();
  } catch {
    return 0;
  }
}

/** @deprecated Use getUnreadCountAction */
export async function getInboxUnreadCountAction(): Promise<number> {
  return getUnreadCountAction();
}

export async function markThreadReadAction(threadId: string): Promise<ContactThread> {
  assertDatabase();
  await requireAdminUser();
  return markContactThreadRead(threadId);
}

export async function markThreadUnreadAction(threadId: string): Promise<ContactThread> {
  assertDatabase();
  await requireAdminUser();
  return markContactThreadUnread(threadId);
}

export async function markAllThreadsReadAction(): Promise<number> {
  assertDatabase();
  await requireAdminUser();
  return markAllContactThreadsRead();
}

export interface SendThreadReplyResult {
  ok: boolean;
  message?: ContactThreadMessage;
  error?: string;
}

export async function sendThreadReplyAction(
  threadId: string,
  body: string,
): Promise<SendThreadReplyResult> {
  assertDatabase();
  const user = await requireAdminUser();

  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Reply cannot be empty." };
  }

  const threadData = await getThreadWithMessages(threadId);
  if (!threadData) {
    return { ok: false, error: "Conversation not found." };
  }

  const { thread } = threadData;
  const senderName = user.user_metadata?.full_name ?? user.email ?? "One By One Ministries";

  let savedMessage: ContactThreadMessage;
  try {
    savedMessage = await createOutboundThreadMessage({
      threadId,
      body: trimmed,
      senderName,
    });
  } catch (error) {
    console.error("[inbox] Failed to save reply:", error);
    return { ok: false, error: "Could not save your reply. Please try again." };
  }

  const provider = getEmailProvider();
  const emailContent = threadReplyEmail({
    visitorName: thread.visitorName,
    subject: thread.subject,
    body: trimmed,
  });

  const emailResult = await provider.send({
    to: thread.visitorEmail,
    replyTo: CONTACT_INBOX,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!emailResult.ok) {
    console.error("[inbox] Visitor reply email failed:", emailResult.error);
    return {
      ok: false,
      error: "Reply was saved but the email could not be sent. Please try again or contact the visitor directly.",
      message: savedMessage,
    };
  }

  try {
    const updated = await markThreadMessageEmailSent(savedMessage.id);
    return { ok: true, message: updated };
  } catch (error) {
    console.error("[inbox] Failed to mark email sent:", error);
    return { ok: true, message: savedMessage };
  }
}
