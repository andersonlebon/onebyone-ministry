"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Save, Shield, Eye, Pencil } from "lucide-react";
import { useSiteStore, AdminUser } from "@/site/lib/siteStore";

const ROLES: AdminUser["role"][] = ["super-admin", "admin", "viewer"];
const ROLE_CONFIG: Record<AdminUser["role"], { label: string; desc: string; color: string }> = {
  "super-admin": { label: "Super Admin", desc: "Full access: content, donations, settings, manage admins", color: "#5A4749" },
  "admin": { label: "Admin", desc: "Manage content, donations, and site settings", color: "#6E9277" },
  "viewer": { label: "Viewer", desc: "Read-only access to dashboard and analytics", color: "#7a7068" },
};

function AdminModal({ admin, onSave, onClose }: { admin?: AdminUser; onSave: (a: Omit<AdminUser, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<AdminUser, "id">>(admin ?? {
    name: "", email: "", role: "admin",
    addedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    addedBy: "admin@obom.org",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3d9ce]">
          <h3 className="text-base text-[#474747]">{admin ? "Edit Admin" : "Add New Admin"}</h3>
          <button onClick={onClose}><X size={16} className="text-[#7a7068]" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Admin full name"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="admin@obom.org"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-3">Role & Permissions</label>
            <div className="space-y-2">
              {ROLES.map((role) => {
                const rc = ROLE_CONFIG[role];
                return (
                  <button key={role} onClick={() => set("role", role)}
                    className="w-full text-left p-3 rounded-xl border-2 transition-all"
                    style={{ borderColor: form.role === role ? rc.color : "#e3d9ce", backgroundColor: form.role === role ? rc.color + "08" : "transparent" }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Shield size={13} style={{ color: rc.color }} />
                      <span className="text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</span>
                    </div>
                    <p className="text-xs text-[#7a7068] ml-5">{rc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#e3d9ce] flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[#474747] border border-[#e3d9ce] hover:bg-[#EFE7DB]">Cancel</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { if (form.name && form.email) { onSave(form); onClose(); } }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: "#6E9277" }}>
            <Save size={13} /> {admin ? "Save Changes" : "Add Admin"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminAdmins() {
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useSiteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | undefined>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-[#474747]">Admin Users</h1>
          <p className="text-sm text-[#7a7068]">{admins.length} administrator{admins.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
          <Plus size={15} /> Add Admin
        </motion.button>
      </div>

      {/* Roles legend */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {ROLES.map((role) => {
          const rc = ROLE_CONFIG[role];
          const count = admins.filter(a => a.role === role).length;
          return (
            <div key={role} className="bg-white rounded-2xl border border-[#e3d9ce] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={15} style={{ color: rc.color }} />
                <p className="text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</p>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "'Francois One', sans-serif", color: "#474747" }}>{count}</p>
              <p className="text-xs text-[#7a7068] mt-1">{rc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Admins list */}
      <div className="space-y-3">
        <AnimatePresence>
          {admins.map((admin, i) => {
            const rc = ROLE_CONFIG[admin.role];
            return (
              <motion.div key={admin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-[#e3d9ce] flex items-center gap-4 px-6 py-4 hover:shadow-sm">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: rc.color }}>
                  {admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[#474747]">{admin.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                      style={{ backgroundColor: rc.color + "15", color: rc.color }}>
                      <Shield size={9} /> {rc.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#7a7068]">{admin.email}</p>
                  <p className="text-xs text-[#a09890] mt-0.5">Added {admin.addedDate} · Last login: {admin.lastLogin || "Never"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditing(admin); setShowModal(true); }}
                    className="p-2 rounded-xl hover:bg-[#EFE7DB] text-[#7a7068]"><Pencil size={14} /></motion.button>
                  {admin.role !== "super-admin" && (
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => { if (confirm("Remove this admin?")) deleteAdmin(admin.id); }}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-400"><Trash2 size={14} /></motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Security note */}
      <div className="mt-6 rounded-2xl p-4 border border-[#e3d9ce] bg-[#EFE7DB]">
        <p className="text-xs text-[#474747] font-semibold mb-1 flex items-center gap-1.5"><Shield size={12} style={{ color: "#6E9277" }} /> Security Note</p>
        <p className="text-xs text-[#7a7068] leading-relaxed">
          Admin credentials are currently stored locally. Connect Supabase to enable secure multi-user authentication, row-level security, and audit logs. Super admins cannot be deleted. Only super admins can add or remove other super admins.
        </p>
      </div>

      <AnimatePresence>
        {showModal && (
          <AdminModal admin={editing} onSave={(a) => editing ? updateAdmin(editing.id, a) : addAdmin(a)} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
