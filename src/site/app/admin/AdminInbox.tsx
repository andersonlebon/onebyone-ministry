"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  MailOpen,
  CheckCheck,
  Loader2,
  Inbox,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";

import {
  getThreadWithMessagesAction,
  listThreadsAction,
  markAllThreadsReadAction,
  markThreadReadAction,
  markThreadUnreadAction,
  sendThreadReplyAction,
} from "@/app/actions/inbox";
import type { ContactThreadListItem } from "@/lib/db/contact-threads";
import type { ContactThread, ContactThreadMessage } from "@/lib/db/schema";

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isUnread(thread: ContactThread | ContactThreadListItem) {
  return !thread.readAt;
}

function previewText(text: string | null | undefined, max = 72) {
  if (!text) return "No messages yet";
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max)}…`;
}

export default function AdminInbox() {
  const [threads, setThreads] = useState<ContactThreadListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactThreadMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<ContactThread | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async (threadId: string) => {
    setThreadLoading(true);
    setError(null);
    try {
      const data = await getThreadWithMessagesAction(threadId);
      if (!data) {
        setSelectedThread(null);
        setMessages([]);
        return;
      }
      setSelectedThread(data.thread);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const loadThreads = useCallback(async (preserveSelection = true, currentSelectedId: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listThreadsAction();
      setThreads(rows);

      const nextId =
        preserveSelection && currentSelectedId && rows.some((r) => r.id === currentSelectedId)
          ? currentSelectedId
          : (rows[0]?.id ?? null);

      setSelectedId(nextId);

      if (nextId) {
        await loadThread(nextId);
      } else {
        setSelectedThread(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [loadThread]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async server action fetch on mount
    void loadThreads(true, null);
  }, [loadThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, threadLoading]);

  const filtered = threads.filter((t) => filter === "all" || isUnread(t));
  const unreadCount = threads.filter(isUnread).length;

  const updateThread = (updated: ContactThread) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              ...t,
              readAt: updated.readAt,
              lastMessageAt: updated.lastMessageAt,
            }
          : t,
      ),
    );
    if (selectedThread?.id === updated.id) {
      setSelectedThread(updated);
    }
  };

  const handleSelect = async (thread: ContactThreadListItem) => {
    setSelectedId(thread.id);
    setReplyText("");
    await loadThread(thread.id);
    if (isUnread(thread)) {
      try {
        const updated = await markThreadReadAction(thread.id);
        updateThread(updated);
      } catch {
        // Selection still works even if mark-read fails.
      }
    }
  };

  const handleMarkUnread = async () => {
    if (!selectedThread) return;
    setActionLoading(true);
    try {
      const updated = await markThreadUnreadAction(selectedThread.id);
      updateThread(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark unread");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllThreadsReadAction();
      setThreads((prev) =>
        prev.map((t) => ({ ...t, readAt: t.readAt ?? new Date() })),
      );
      if (selectedThread) {
        setSelectedThread((prev) => (prev ? { ...prev, readAt: prev.readAt ?? new Date() } : prev));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      const result = await sendThreadReplyAction(selectedThread.id, replyText);
      if (!result.ok) {
        setError(result.error ?? "Failed to send reply");
        if (result.message) {
          setMessages((prev) => [...prev, result.message!]);
          setReplyText("");
        }
        return;
      }
      if (result.message) {
        setMessages((prev) => [...prev, result.message!]);
        setReplyText("");
        setThreads((prev) =>
          prev.map((t) =>
            t.id === selectedThread.id
              ? {
                  ...t,
                  lastMessageAt: result.message!.createdAt,
                  lastMessagePreview: result.message!.body,
                }
              : t,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#474747]">Contact Inbox</h1>
          <p className="text-sm text-[#7a7068] mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread conversation${unreadCount === 1 ? "" : "s"}`
              : "All conversations read"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadThreads(true, selectedId)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#474747] border border-[#e3d9ce] hover:bg-[#EFE7DB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void handleMarkAllRead()}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#6E9277" }}
            >
              <CheckCheck size={14} />
              Mark all read
            </motion.button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e3d9ce] overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
        {/* Conversation list */}
        <div className="lg:w-[340px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#e3d9ce]">
          <div className="flex border-b border-[#e3d9ce]">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  filter === f
                    ? "text-[#6E9277] bg-[#6E9277]/8"
                    : "text-[#7a7068] hover:bg-[#EFE7DB]"
                }`}
              >
                {f === "all" ? "All" : "Unread"}
                {f === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#6E9277] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[420px] lg:max-h-[520px]">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[#7a7068]">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#7a7068] px-6 text-center">
                <Inbox size={32} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">
                  {filter === "unread" ? "No unread conversations" : "No conversations yet"}
                </p>
                <p className="text-xs mt-1">Contact form submissions will appear here.</p>
              </div>
            ) : (
              filtered.map((thread) => {
                const active = thread.id === selectedId;
                const unread = isUnread(thread);
                return (
                  <button
                    key={thread.id}
                    onClick={() => void handleSelect(thread)}
                    className={`w-full text-left px-4 py-3.5 border-b border-[#e3d9ce] transition-colors ${
                      active ? "bg-[#6E9277]/10" : "hover:bg-[#EFE7DB]/60"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {unread ? (
                        <Mail size={14} className="flex-shrink-0 mt-0.5 text-[#6E9277]" />
                      ) : (
                        <MailOpen size={14} className="flex-shrink-0 mt-0.5 text-[#7a7068]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm truncate ${unread ? "font-semibold text-[#474747]" : "text-[#474747]"}`}
                          >
                            {thread.visitorName}
                          </span>
                          <span className="text-[10px] text-[#a09890] flex-shrink-0">
                            {formatShortDate(thread.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#7a7068] truncate mt-0.5">{thread.subject}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-[#a09890] truncate">
                            {previewText(thread.lastMessagePreview)}
                          </p>
                          {unread && (
                            <span className="w-2 h-2 rounded-full bg-[#6E9277] flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread panel */}
        <div className="flex-1 flex flex-col min-h-[320px]">
          {selectedThread ? (
            <>
              <div className="px-6 py-4 border-b border-[#e3d9ce] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#474747]">{selectedThread.subject}</h2>
                  <p className="text-sm text-[#7a7068] mt-1">
                    With{" "}
                    <span className="font-medium text-[#474747]">{selectedThread.visitorName}</span>
                    {" · "}
                    <a
                      href={`mailto:${selectedThread.visitorEmail}`}
                      className="text-[#6E9277] hover:underline"
                    >
                      {selectedThread.visitorEmail}
                    </a>
                  </p>
                  <p className="text-xs text-[#a09890] mt-1">
                    Started {formatDate(selectedThread.createdAt)}
                  </p>
                </div>
                {!isUnread(selectedThread) && (
                  <button
                    onClick={() => void handleMarkUnread()}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7a7068] border border-[#e3d9ce] hover:bg-[#EFE7DB] disabled:opacity-50 self-start"
                  >
                    <Mail size={13} />
                    Mark unread
                  </button>
                )}
              </div>

              <div className="flex-1 px-4 sm:px-6 py-5 overflow-y-auto bg-[#FAF7F2]/40">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-12 text-[#7a7068]">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-[#7a7068] text-center py-8">No messages in this thread.</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const inbound = msg.direction === "inbound";
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${inbound ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                              inbound
                                ? "bg-white border border-[#e3d9ce] rounded-bl-md"
                                : "text-white rounded-br-md"
                            }`}
                            style={inbound ? undefined : { backgroundColor: "#6E9277" }}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span
                                className={`text-xs font-semibold ${inbound ? "text-[#474747]" : "text-white/90"}`}
                              >
                                {msg.senderName}
                              </span>
                              <span
                                className={`text-[10px] ${inbound ? "text-[#a09890]" : "text-white/70"}`}
                              >
                                {formatDate(msg.createdAt)}
                              </span>
                            </div>
                            <p
                              className={`text-sm leading-relaxed whitespace-pre-wrap ${inbound ? "text-[#474747]" : "text-white"}`}
                            >
                              {msg.body}
                            </p>
                            {!inbound && msg.emailSentAt && (
                              <p className="text-[10px] text-white/60 mt-1.5">Sent by email</p>
                            )}
                            {!inbound && !msg.emailSentAt && (
                              <p className="text-[10px] text-white/60 mt-1.5">Saved (email pending)</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-6 py-4 border-t border-[#e3d9ce] bg-white">
                <label htmlFor="inbox-reply" className="sr-only">
                  Reply to visitor
                </label>
                <div className="flex gap-2 items-end">
                  <textarea
                    id="inbox-reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply…"
                    rows={3}
                    disabled={sending}
                    className="flex-1 resize-none rounded-xl border border-[#e3d9ce] px-4 py-3 text-sm text-[#474747] placeholder:text-[#a09890] focus:outline-none focus:ring-2 focus:ring-[#6E9277]/30 focus:border-[#6E9277] disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        void handleSendReply();
                      }
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleSendReply()}
                    disabled={sending || !replyText.trim()}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex-shrink-0"
                    style={{ backgroundColor: "#6E9277" }}
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Send
                  </motion.button>
                </div>
                <p className="text-[11px] text-[#a09890] mt-2">
                  Replies are emailed to the visitor. They can reply to reach contact@onebyoneministries.org.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-[#7a7068] px-6">
              <MailOpen size={36} className="mb-3 opacity-40" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
