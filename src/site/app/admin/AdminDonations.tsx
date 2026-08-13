"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Clock, Plus, Trash2, X, Save, DollarSign, Search, Filter, Eye, RefreshCw, type LucideIcon } from "lucide-react";
import { getDonationReceiptUrlAction } from "@/app/actions/donations";
import { monthlyRecurringTotal, totalRaised } from "@/lib/donate/admin-totals";
import { useSiteStore, Donation } from "@/site/lib/siteStore";

const METHOD_LABELS: Record<Donation["method"], string> = {
  card: "Credit Card", paypal: "PayPal", bank: "Bank Transfer", "cash-app": "Cash App",
  venmo: "Venmo", zelle: "Zelle", check: "Check", crypto: "Crypto", daf: "DAF", other: "Other",
};

const STATUS_CONFIG: Record<Donation["status"], { label: string; color: string; bg: string; icon: LucideIcon }> = {
  completed: { label: "Completed", color: "#6E9277", bg: "#6E9277" + "15", icon: CheckCircle2 },
  approved:  { label: "Approved",  color: "#5a7d64", bg: "#5a7d64" + "15", icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "#d97706", bg: "#d97706" + "15", icon: Clock },
  rejected:  { label: "Rejected",  color: "#dc2626", bg: "#dc2626" + "15", icon: XCircle },
};

function AddDonationModal({ onSave, onClose }: { onSave: (d: Omit<Donation, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Donation, "id">>({
    name: "", email: "", amount: 0, currency: "USD", method: "bank",
    status: "pending", frequency: "one-time", date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), notes: "", transactionId: "",
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted">
          <h3 className="text-base text-foreground">Record Manual Donation</h3>
          <button onClick={onClose}><X size={16} className="text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Donor Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Amount (USD)</label>
              <div className="relative">
                <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="number" value={form.amount} onChange={(e) => set("amount", parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Frequency</label>
              <select value={form.frequency} onChange={(e) => set("frequency", e.target.value as Donation["frequency"])} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                <option value="one-time">One-Time</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Method</label>
              <select value={form.method} onChange={(e) => set("method", e.target.value as Donation["method"])} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as Donation["status"])} className="w-full px-3 py-2.5 rounded-xl border text-sm bg-card focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Transaction ID / Reference</label>
            <input value={form.transactionId || ""} onChange={(e) => set("transactionId", e.target.value)} placeholder="Check #, wire ref, etc." className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] resize-none" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-muted flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-foreground border border-muted hover:bg-muted">Cancel</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { if (form.name && form.amount > 0) { onSave(form); onClose(); } }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: "#6E9277" }}>
            <Save size={13} /> Record Donation
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDonations() {
  const { donations, updateDonation, deleteDonation, addDonation, refreshDonations } = useSiteStore();
  const [statusFilter, setStatusFilter] = useState<Donation["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [proofLoading, setProofLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const openProof = async (id: string) => {
    const proofWindow = window.open("about:blank", "_blank");
    if (proofWindow) proofWindow.opener = null;
    setProofLoading(id);
    try {
      const url = await getDonationReceiptUrlAction(id);
      if (proofWindow) proofWindow.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      proofWindow?.close();
      alert(error instanceof Error ? error.message : "Could not open receipt proof.");
    } finally {
      setProofLoading(null);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await refreshDonations();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = donations.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.transactionId || "").includes(search);
    return matchStatus && matchSearch;
  });

  const total = totalRaised(donations);
  const pending = donations.filter(d => d.status === "pending");
  const monthly = monthlyRecurringTotal(donations);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Donations</h1>
          <p className="text-sm text-muted-foreground">{donations.length} records · {pending.length} pending approval</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void refresh()} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-muted text-foreground disabled:opacity-50">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
            <Plus size={15} /> Record Donation
          </motion.button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Total Raised", value: `$${total.toLocaleString()}`, sub: "All approved & completed", color: "#6E9277" },
          { label: "Monthly Recurring", value: `$${monthly.toLocaleString()}/mo`, sub: "Active monthly donors", color: "#5A4749" },
          { label: "Pending Approval", value: pending.length.toString(), sub: "Require manual review", color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-muted p-5">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "'Francois One', sans-serif" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals highlight */}
      {pending.length > 0 && (
        <div className="mb-5 rounded-2xl p-4 border-2" style={{ borderColor: "#d97706" + "40", backgroundColor: "#d97706" + "08" }}>
          <p className="text-sm font-semibold text-[#d97706] mb-3 flex items-center gap-2">
            <Clock size={15} /> {pending.length} donation{pending.length > 1 ? "s" : ""} pending your approval
          </p>
          <div className="space-y-2">
            {pending.map((d) => (
              <div key={d.id} className="bg-card rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.name} — <span style={{ color: "#6E9277" }}>${d.amount.toLocaleString()}</span> via {METHOD_LABELS[d.method]}</p>
                  <p className="text-xs text-muted-foreground">{d.notes || d.date}</p>
                </div>
                <div className="flex gap-2">
                  {d.receiptPath && (
                    <button onClick={() => void openProof(d.id)} disabled={proofLoading === d.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-muted text-foreground disabled:opacity-50">
                      <Eye size={12} /> {proofLoading === d.id ? "Opening..." : "View proof"}
                    </button>
                  )}
                  <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                    onClick={() => updateDonation(d.id, { status: "approved" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
                    <CheckCircle2 size={12} /> Approve
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                    onClick={() => updateDonation(d.id, { status: "rejected" })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50">
                    <XCircle size={12} /> Reject
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donor, email, ref..."
            className="pl-8 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#6E9277] w-56" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={13} className="text-muted-foreground" />
          {(["all", "completed", "approved", "pending", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Donations table */}
      <div className="bg-card rounded-2xl border border-muted overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_120px_100px_110px_130px] gap-0 px-5 py-3 border-b border-muted text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Donor</span><span>Amount</span><span>Method</span><span>Type</span><span>Status</span><span>Actions</span>
        </div>
        <div className="divide-y divide-muted">
          <AnimatePresence>
            {filtered.map((d, i) => {
              const sc = STATUS_CONFIG[d.status];
              const StatusIcon = sc.icon;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[1fr_100px_120px_100px_110px_130px] gap-0 px-5 py-3.5 items-center hover:bg-muted">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.email} · {d.date}</p>
                    {d.transactionId && <p className="text-xs text-muted-foreground/70 font-mono">{d.transactionId}</p>}
                    {d.transferDate && <p className="text-xs text-muted-foreground">Transfer date: {d.transferDate}</p>}
                  </div>
                  <p className="text-sm font-bold" style={{ color: "#6E9277" }}>${d.amount.toLocaleString()}</p>
                  <p className="text-xs text-foreground">{METHOD_LABELS[d.method]}</p>
                  <p className="text-xs text-foreground capitalize">{d.frequency}</p>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit" style={{ backgroundColor: sc.bg, color: sc.color }}>
                    <StatusIcon size={11} /> {sc.label}
                  </span>
                  <div className="flex gap-1">
                    {d.receiptPath && (
                      <button onClick={() => void openProof(d.id)} disabled={proofLoading === d.id}
                        className="p-1.5 rounded-lg hover:bg-muted text-foreground disabled:opacity-50" title="View private proof">
                        <Eye size={14} />
                      </button>
                    )}
                    {d.status === "pending" && (
                      <motion.button whileHover={{ scale: 1.12 }} onClick={() => updateDonation(d.id, { status: "approved" })}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-[#6E9277]" title="Approve">
                        <CheckCircle2 size={14} />
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.12 }} onClick={() => { if (confirm("Delete this donation record?")) deleteDonation(d.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Delete">
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No donations found.</div>}
        </div>
      </div>

      <AnimatePresence>
        {showModal && <AddDonationModal onSave={addDonation} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
