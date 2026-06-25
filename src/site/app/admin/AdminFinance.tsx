"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import { isDemoContentEnabled } from "@/lib/runtime-env";
import type { FinanceDetails } from "@/lib/site-content/types";
import { useSiteStore } from "@/site/lib/siteStore";

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-muted bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }}
        />
      )}
    </div>
  );
}

function hasFinanceConfigured(finance: FinanceDetails) {
  return Boolean(
    finance.financeEmail ||
      finance.taxStatus.ein ||
      finance.bankTransfer.some((row) => row.value) ||
      finance.mobileGiving.some((row) => row.value)
  );
}

export default function AdminFinance() {
  const { finance, updateFinance } = useSiteStore();
  const [form, setForm] = useState<FinanceDetails>(finance);
  const [saved, setSaved] = useState(false);

  const setTax = (key: keyof FinanceDetails["taxStatus"], value: string) =>
    setForm((f) => ({ ...f, taxStatus: { ...f.taxStatus, [key]: value } }));

  const setBankRow = (index: number, value: string) =>
    setForm((f) => ({
      ...f,
      bankTransfer: f.bankTransfer.map((row, i) => (i === index ? { ...row, value } : row)),
    }));

  const setMobileRow = (index: number, value: string) =>
    setForm((f) => ({
      ...f,
      mobileGiving: f.mobileGiving.map((row, i) => (i === index ? { ...row, value } : row)),
    }));

  const handleSave = async () => {
    await updateFinance(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-foreground">Finance Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Giving instructions for staff and the public donate page. Changes save to the database and appear on /donate.
          </p>
          {isDemoContentEnabled() && !hasFinanceConfigured(form) && (
            <p className="text-xs text-amber-600 mt-2">Development mode: fill in real client details before production handoff.</p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleSave()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: saved ? "#5a7d64" : "#6E9277" }}
        >
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </motion.button>
      </div>

      {!hasFinanceConfigured(form) && (
        <div className="rounded-2xl border border-muted bg-card p-6 mb-6 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Add your real EIN, bank details, and giving instructions below. These are stored securely in the database for staff reference.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        <DetailCard title="Tax & Receipt Info">
          <div className="space-y-4">
            <Field label="Tax status" value={form.taxStatus.label} onChange={(v) => setTax("label", v)} />
            <Field label="EIN" value={form.taxStatus.ein} onChange={(v) => setTax("ein", v)} />
            <Field label="Finance email" value={form.financeEmail} onChange={(v) => setForm((f) => ({ ...f, financeEmail: v }))} />
            <Field label="Tax note" value={form.taxStatus.taxNote} onChange={(v) => setTax("taxNote", v)} multiline />
          </div>
        </DetailCard>

        <DetailCard title="Bank Transfer">
          <div className="space-y-4">
            {form.bankTransfer.map((row, index) => (
              <Field key={row.label} label={row.label} value={row.value} onChange={(v) => setBankRow(index, v)} />
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Mobile Giving">
          <div className="space-y-4">
            {form.mobileGiving.map((row, index) => (
              <Field key={row.label} label={row.label} value={row.value} onChange={(v) => setMobileRow(index, v)} />
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Check By Mail">
          <div className="space-y-4">
            <Field label="Payable to" value={form.checkByMail.payableTo} onChange={(v) => setForm((f) => ({ ...f, checkByMail: { ...f.checkByMail, payableTo: v } }))} />
            <Field label="Mailing address" value={form.checkByMail.mailingAddress} onChange={(v) => setForm((f) => ({ ...f, checkByMail: { ...f.checkByMail, mailingAddress: v } }))} multiline />
            <Field label="Memo" value={form.checkByMail.memo} onChange={(v) => setForm((f) => ({ ...f, checkByMail: { ...f.checkByMail, memo: v } }))} />
          </div>
        </DetailCard>

        <DetailCard title="Cryptocurrency">
          <div className="space-y-4">
            {form.crypto.map((item, index) => (
              <Field
                key={item.coin}
                label={item.coin}
                value={item.address}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    crypto: f.crypto.map((row, i) => (i === index ? { ...row, address: v } : row)),
                  }))
                }
              />
            ))}
          </div>
        </DetailCard>

        <DetailCard title="DAF / Stock">
          <div className="space-y-4">
            <Field label="DAF search name" value={form.donorAdvisedFund.searchName} onChange={(v) => setForm((f) => ({ ...f, donorAdvisedFund: { ...f.donorAdvisedFund, searchName: v } }))} />
            <Field label="DAF EIN" value={form.donorAdvisedFund.ein} onChange={(v) => setForm((f) => ({ ...f, donorAdvisedFund: { ...f.donorAdvisedFund, ein: v } }))} />
            <Field label="DAF note" value={form.donorAdvisedFund.note} onChange={(v) => setForm((f) => ({ ...f, donorAdvisedFund: { ...f.donorAdvisedFund, note: v } }))} multiline />
            <Field label="Stock / securities note" value={form.stockAndSecurities.note} onChange={(v) => setForm((f) => ({ ...f, stockAndSecurities: { note: v } }))} multiline />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
