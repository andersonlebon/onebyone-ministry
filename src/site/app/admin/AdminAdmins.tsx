"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Save, Shield, Pencil, Mail, RefreshCw } from "lucide-react";
import {
  inviteAdminAction,
  listAdminsAction,
  removeAdminAction,
  resendAdminInviteAction,
  updateAdminRoleAction,
  type AdminListItem,
} from "@/app/actions/admins";
import type { AdminRole } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const ROLES: AdminRole[] = ["super-admin", "admin", "viewer"];
const INVITE_ROLES: AdminRole[] = ["admin", "viewer"];

const ROLE_CONFIG: Record<AdminRole, { label: string; desc: string; color: string }> = {
  "super-admin": { label: "Super Admin", desc: "Full access, setup owner, manages admins", color: "#5A4749" },
  admin: { label: "Admin", desc: "Manage content, donations, inbox, and settings", color: "#6E9277" },
  viewer: { label: "Viewer", desc: "Read-only access to the admin dashboard", color: "#7a7068" },
};

function formatActionError(err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong.";
  if (message.includes("Server Action") && message.includes("was not found")) {
    return "The site was just updated. Hard refresh this page (Ctrl+Shift+R or Cmd+Shift+R), then try again.";
  }
  return message;
}

function AdminModal({
  admin,
  onInvite,
  onSaveRole,
  onClose,
}: {
  admin?: AdminListItem;
  onInvite: (input: { name: string; email: string; role: AdminRole }) => Promise<void>;
  onSaveRole: (input: { userId: string; role: AdminRole }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    role: (admin?.role === "super-admin" ? "admin" : admin?.role ?? "admin") as AdminRole,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (admin) {
        await onSaveRole({ userId: admin.id, role: form.role });
      } else {
        await onInvite({ name: form.name, email: form.email, role: form.role });
      }
      onClose();
    } catch (err) {
      setError(formatActionError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = admin ? (admin.role === "super-admin" ? ["super-admin"] as AdminRole[] : INVITE_ROLES) : INVITE_ROLES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">{admin ? "Edit Admin" : "Invite Admin"}</h3>
          <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          {!admin && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              An invitation email will be sent with a link to set a password and join the admin portal.
            </p>
          )}
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Admin full name"
              disabled={Boolean(admin)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] disabled:bg-input-background"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="admin@example.com"
              disabled={Boolean(admin)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] disabled:bg-input-background"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-3">Role & Permissions</label>
            <div className="space-y-2">
              {roleOptions.map((role) => {
                const rc = ROLE_CONFIG[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => set("role", role)}
                    disabled={admin?.role === "super-admin"}
                    className="w-full text-left p-3 rounded-xl border-2 transition-all disabled:opacity-70"
                    style={{
                      borderColor: form.role === role ? rc.color : "#e3d9ce",
                      backgroundColor: form.role === role ? `${rc.color}08` : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <Shield size={13} style={{ color: rc.color }} />
                      <span className="text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-5">{rc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted">Cancel</button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={submitting || !form.name || !form.email}
            onClick={() => void handleSubmit()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-60"
            style={{ backgroundColor: "#6E9277" }}
          >
            <Save size={13} /> {admin ? "Save Changes" : submitting ? "Sending..." : "Send Invitation"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminListItem | undefined>();
  const supabaseEnabled = isSupabaseConfigured();

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await listAdminsAction();
      setAdmins(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const handleInvite = async (input: { name: string; email: string; role: AdminRole }) => {
    const result = await inviteAdminAction(input);
    if (!result.ok) throw new Error(result.error);
    setMessage(result.message);
    await loadAdmins();
  };

  const handleSaveRole = async (input: { userId: string; role: AdminRole }) => {
    const result = await updateAdminRoleAction(input);
    if (!result.ok) throw new Error(result.error);
    setMessage("Admin role updated.");
    await loadAdmins();
  };

  const handleRemove = async (admin: AdminListItem) => {
    if (!confirm(`Remove ${admin.email} from the admin portal?`)) return;
    const result = await removeAdminAction(admin.id);
    if (!result.ok) {
      setError(result.error ?? "Could not remove admin.");
      return;
    }
    setMessage(`${admin.email} removed.`);
    await loadAdmins();
  };

  const handleResend = async (admin: AdminListItem) => {
    const result = await resendAdminInviteAction(admin.email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Admin Users</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${admins.length} staff account${admins.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditing(undefined); setShowModal(true); }}
          disabled={!supabaseEnabled}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#6E9277" }}
        >
          <Plus size={15} /> Invite Admin
        </motion.button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-[#eef5f0] text-[#3d5f48] border border-[#cfe0d3]">{message}</div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-7">
        {ROLES.map((role) => {
          const rc = ROLE_CONFIG[role];
          const count = admins.filter((a) => a.role === role).length;
          return (
            <div key={role} className="bg-card rounded-2xl border border-muted p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={15} style={{ color: rc.color }} />
                <p className="text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Francois One', sans-serif" }}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{rc.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {admins.map((admin, i) => {
            const rc = ROLE_CONFIG[admin.role];
            return (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border border-muted flex items-center gap-4 px-6 py-4 hover:shadow-sm"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: rc.color }}
                >
                  {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{admin.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: `${rc.color}15`, color: rc.color }}>
                      <Shield size={9} /> {rc.label}
                    </span>
                    {admin.status === "invited" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">Invited</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Added {new Date(admin.createdAt).toLocaleDateString()} · Last login: {admin.lastSignIn ? new Date(admin.lastSignIn).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {admin.status === "invited" && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => void handleResend(admin)} className="p-2 rounded-xl hover:bg-muted text-[#6E9277]" title="Resend invitation">
                      <RefreshCw size={14} />
                    </motion.button>
                  )}
                  {admin.role !== "super-admin" && (
                    <>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditing(admin); setShowModal(true); }} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                        <Pencil size={14} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => void handleRemove(admin)} className="p-2 rounded-xl hover:bg-red-50 text-red-400">
                        <Trash2 size={14} />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6 rounded-2xl p-4 border border-muted bg-muted">
        <p className="text-xs text-foreground font-semibold mb-1 flex items-center gap-1.5">
          <Mail size={12} style={{ color: "#6E9277" }} /> How invitations work
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Public website visitors do not need accounts. Only invited staff receive a branded invitation email with a link to set a password at `/admin/accept-invite`. Requires `EMAIL_PROVIDER=brevo` in production. Super-admin is created once at `/setup` by {`buyananderson@gmail.com`}.
        </p>
      </div>

      <AnimatePresence>
        {showModal && (
          <AdminModal
            admin={editing}
            onInvite={handleInvite}
            onSaveRole={handleSaveRole}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
