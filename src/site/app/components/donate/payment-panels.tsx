"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import {
  Shield,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  Upload,
} from "lucide-react";

import { parseDonationAmount } from "@/lib/donate/amount";
import {
  DONATION_RECEIPTS_BUCKET,
  DONATION_RECEIPT_TYPES,
  MAX_DONATION_RECEIPT_BYTES,
} from "@/lib/donate/receipt-types";
import {
  bankDetailsText,
  cashAppPayUrl,
  financeReceiptMailto,
  getMobileGivingValue,
  hasBankDetails,
  hasCheckDetails,
  hasCryptoDetails,
  hasDafDetails,
  venmoPayUrl,
  zelleReceiptMailto,
} from "@/lib/donate/payment-links";
import type { FinanceDetails } from "@/lib/site-content/types";
import { createClient } from "@/lib/supabase/client";
import { useColors } from "@/site/lib/themeStore";

function useDonationColors() {
  return useColors();
}

function AmountError({ amount }: { amount: string }) {
  if (parseDonationAmount(amount)) return null;
  return (
    <p className="text-sm text-red-600 mb-3">Enter a valid donation amount of at least $1 above.</p>
  );
}

function AmountSummary({ amount, frequency, label = "You are giving" }: { amount: string; frequency?: string; label?: string }) {
  const c = useDonationColors();
  const parsed = parseDonationAmount(amount);
  return (
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cream }}>
      <p className="text-sm mb-1" style={{ color: c.muted }}>{label}</p>
      <p className="text-2xl" style={{ color: c.text, fontFamily: "'Francois One', sans-serif" }}>
        ${parsed ? (parsed % 1 === 0 ? parsed : parsed.toFixed(2)) : "0"}
        {frequency === "monthly" ? " / mo" : ""}
      </p>
    </div>
  );
}

function UnconfiguredPanel({ message }: { message: string }) {
  const c = useDonationColors();
  return (
    <div className="rounded-xl p-5 text-sm" style={{ border: `1px solid ${c.borderLight}`, color: c.muted }}>
      <p>{message} Add details in admin under Finance, or{" "}
        <Link href="/contact" className="font-semibold" style={{ color: "#6E9277" }}>contact us</Link>.</p>
    </div>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const c = useDonationColors();
  const [copied, setCopied] = useState(false);

  if (!value.trim()) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl p-4" style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}>
      <p className="text-xs font-semibold mb-1" style={{ color: c.text }}>{label}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold break-all font-mono" style={{ color: "#6E9277" }}>{value}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
          style={{ backgroundColor: c.cream, color: c.text }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function StripeCheckoutForm({ amount, frequency }: { amount: string; frequency: string }) {
  const c = useDonationColors();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const validAmount = parseDonationAmount(amount);

  const onSubmit = async (data: Record<string, string>) => {
    if (!validAmount) return;
    setProcessing(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: validAmount,
          frequency,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.url) {
        window.location.assign(json.url);
        return;
      }
      setCheckoutError(json.error ?? "Card checkout is not available right now. Try Venmo or another method.");
    } catch {
      setCheckoutError("We could not start checkout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AmountError amount={amount} />
      <p className="text-sm leading-relaxed" style={{ color: c.muted }}>
        You will complete payment securely on Stripe Checkout (card, Apple Pay, or Google Pay). We never store card numbers on this site.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>First Name</label>
          <input {...register("firstName", { required: true })} placeholder="First name"
            className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
            style={{ color: c.text, borderColor: errors.firstName ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Last Name</label>
          <input {...register("lastName", { required: true })} placeholder="Last name"
            className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
            style={{ color: c.text, borderColor: errors.lastName ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Email (for receipt)</label>
        <input {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} type="email" placeholder="your@email.com"
          className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
          style={{ color: c.text, borderColor: errors.email ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
      </div>
      {checkoutError && <p className="text-sm text-red-600">{checkoutError}</p>}
      <motion.button
        type="submit"
        disabled={processing || !validAmount}
        whileHover={{ scale: validAmount ? 1.02 : 1 }}
        whileTap={{ scale: validAmount ? 0.98 : 1 }}
        className="w-full py-4 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        style={{ backgroundColor: "#6E9277" }}
      >
        {processing ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <><CreditCard size={17} /> Continue to Secure Checkout · ${validAmount ?? "0"}{frequency === "monthly" ? "/mo" : ""}</>
        )}
      </motion.button>
      <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: c.muted }}>
        <Shield size={11} /> Powered by Stripe · Tax-deductible when applicable
      </p>
    </form>
  );
}

export function VenmoPanel({ amount, frequency, finance }: { amount: string; frequency: string; finance: FinanceDetails }) {
  const handle = getMobileGivingValue(finance, "Venmo");
  const validAmount = parseDonationAmount(amount);

  if (!handle) {
    return <UnconfiguredPanel message="Venmo is not configured yet." />;
  }

  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`;

  return (
    <div className="space-y-4">
      <AmountError amount={amount} />
      <AmountSummary amount={amount} frequency={frequency} />
      <CopyField label="Venmo username" value={displayHandle} />
      <motion.a
        href={validAmount ? venmoPayUrl(handle, amount, "Donation to One By One Ministries", frequency) : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!validAmount}
        whileHover={{ scale: validAmount ? 1.03 : 1 }}
        whileTap={{ scale: validAmount ? 0.97 : 1 }}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 ${!validAmount ? "pointer-events-none opacity-50" : ""}`}
        style={{ backgroundColor: "#008CFF" }}
      >
        <ExternalLink size={18} /> Open Venmo to Give
      </motion.a>
      {finance.financeEmail && (
        <a
          href={financeReceiptMailto(finance.financeEmail, "Venmo", amount, `Venmo: ${displayHandle}`)}
          className="flex items-center justify-center gap-2 text-xs font-semibold py-2"
          style={{ color: "#6E9277" }}
        >
          <Mail size={14} /> Email us for a tax receipt after sending
        </a>
      )}
    </div>
  );
}

export function MobilePayPanel({ amount, finance }: { amount: string; finance: FinanceDetails }) {
  const c = useDonationColors();
  const cashApp = getMobileGivingValue(finance, "Cash App");
  const zelle = getMobileGivingValue(finance, "Zelle");
  const validAmount = parseDonationAmount(amount);

  if (!cashApp && !zelle) {
    return <UnconfiguredPanel message="Cash App and Zelle are not configured yet." />;
  }

  return (
    <div className="space-y-4">
      <AmountError amount={amount} />
      <AmountSummary amount={amount} label="Suggested amount" />
      {cashApp && (
        <>
          <CopyField label="Cash App" value={cashApp.startsWith("$") ? cashApp : `$${cashApp}`} />
          <motion.a
            href={validAmount ? cashAppPayUrl(cashApp, amount) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 ${!validAmount ? "pointer-events-none opacity-50" : ""}`}
            style={{ backgroundColor: "#00D632" }}
          >
            <ExternalLink size={16} /> Open Cash App to Give
          </motion.a>
        </>
      )}
      {zelle && (
        <>
          <CopyField label="Zelle" value={zelle} />
          <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
            Open your bank app, choose Zelle, send to the address above, and use memo &quot;Donation&quot;.
          </p>
          {finance.financeEmail && (
            <a
              href={zelleReceiptMailto(finance.financeEmail, amount)}
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2"
              style={{ color: "#6E9277" }}
            >
              <Mail size={14} /> Request a tax receipt after sending
            </a>
          )}
        </>
      )}
    </div>
  );
}

function BankReceiptForm({ amount }: { amount: string }) {
  const c = useDonationColors();
  const validAmount = parseDonationAmount(amount);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validAmount || !file) {
      setError("Enter a valid amount and choose a receipt file.");
      return;
    }
    if (
      !(DONATION_RECEIPT_TYPES as readonly string[]).includes(file.type) ||
      file.size > MAX_DONATION_RECEIPT_BYTES
    ) {
      setError("Choose a JPEG, PNG, or PDF receipt no larger than 10 MB.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const uploadResponse = await fetch("/api/donate/bank-receipt/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          company,
        }),
      });
      const upload = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok || !upload.intentId || !upload.path || !upload.token) {
        throw new Error(upload.error ?? "Could not prepare the receipt upload.");
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(DONATION_RECEIPTS_BUCKET)
        .uploadToSignedUrl(upload.path, upload.token, file, {
          contentType: file.type,
        });
      if (uploadError) throw uploadError;

      const finalizeResponse = await fetch("/api/donate/bank-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: upload.intentId,
          name,
          email,
          amount: validAmount,
          transferDate,
          reference,
          notes,
          company,
        }),
      });
      const result = await finalizeResponse.json().catch(() => ({}));
      if (!finalizeResponse.ok) {
        throw new Error(result.error ?? "Could not submit receipt proof.");
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit receipt proof.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl p-5 flex items-start gap-3" style={{ backgroundColor: "#6E927715", color: c.text }}>
        <CheckCircle2 size={20} style={{ color: "#6E9277" }} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">We received your transfer proof.</p>
          <p className="text-xs mt-1" style={{ color: c.muted }}>
            Finance will verify the transfer and send a receipt to {email}.
          </p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]";
  return (
    <form onSubmit={submit} className="space-y-4 pt-3 border-t" style={{ borderColor: c.borderLight }}>
      <div>
        <h4 className="text-sm font-semibold" style={{ color: c.text }}>Upload transfer proof</h4>
        <p className="text-xs mt-1" style={{ color: c.muted }}>
          After sending the transfer, submit a screenshot or PDF. This is a one-time gift and will remain pending until finance verifies it.
        </p>
      </div>
      <AmountError amount={amount} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className={inputClass} style={{ borderColor: c.borderLight }} />
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for receipt" className={inputClass} style={{ borderColor: c.borderLight }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Transfer date</label>
          <input required type="date" value={transferDate} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setTransferDate(event.target.value)} className={inputClass} style={{ borderColor: c.borderLight }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Reference (optional)</label>
          <input value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} placeholder="Wire or transfer reference" className={inputClass} style={{ borderColor: c.borderLight }} />
        </div>
      </div>
      <textarea value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Note for finance (optional)" rows={2} className={`${inputClass} resize-none`} style={{ borderColor: c.borderLight }} />
      <label className="block rounded-xl border border-dashed p-4 cursor-pointer text-center" style={{ borderColor: c.borderLight }}>
        <Upload size={18} className="mx-auto mb-2" style={{ color: "#6E9277" }} />
        <span className="text-xs font-semibold" style={{ color: c.text }}>
          {file ? file.name : "Choose receipt (JPEG, PNG, or PDF)"}
        </span>
        <span className="block text-[11px] mt-1" style={{ color: c.muted }}>Maximum 10 MB. Stored privately.</span>
        <input
          required
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <input tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !validAmount}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: "#6E9277" }}
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {submitting ? "Submitting securely..." : "Submit Transfer Proof"}
      </button>
    </form>
  );
}

export function BankPanel({ amount, finance }: { amount: string; finance: FinanceDetails }) {
  const c = useDonationColors();
  const [copiedAll, setCopiedAll] = useState(false);

  if (!hasBankDetails(finance)) {
    return <UnconfiguredPanel message="Bank transfer details are not configured yet." />;
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(bankDetailsText(finance));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-4">
      <AmountSummary amount={amount} label="Reference amount" />
      <div className="space-y-3">
        {finance.bankTransfer.filter((row) => row.value.trim()).map((row) => (
          <CopyField key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => void copyAll()}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        style={{ backgroundColor: c.cream, color: c.text }}
      >
        {copiedAll ? <Check size={16} /> : <Copy size={16} />}
        {copiedAll ? "All bank details copied" : "Copy all bank details"}
      </button>
      <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
        Use memo &quot;Donation&quot; on your transfer, then upload proof below for finance verification.
      </p>
      <BankReceiptForm amount={amount} />
    </div>
  );
}

export function OtherPanel({ amount, finance }: { amount: string; finance: FinanceDetails }) {
  const c = useDonationColors();
  const hasAny = hasCryptoDetails(finance) || hasCheckDetails(finance) || hasDafDetails(finance) || finance.stockAndSecurities.note.trim();

  if (!hasAny) {
    return <UnconfiguredPanel message="Alternative giving details are not configured yet." />;
  }

  return (
    <div className="space-y-4">
      <AmountSummary amount={amount} label="Planned gift amount" />

      {hasCryptoDetails(finance) && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold" style={{ color: c.text }}>Cryptocurrency</h4>
          {finance.crypto.filter((item) => item.address.trim()).map((item) => (
            <CopyField key={item.coin} label={item.coin} value={item.address} />
          ))}
        </div>
      )}

      {hasCheckDetails(finance) && (
        <div className="rounded-xl p-5 space-y-3" style={{ border: `1px solid ${c.borderLight}` }}>
          <h4 className="text-sm font-semibold" style={{ color: c.text }}>Check by Mail</h4>
          {finance.checkByMail.payableTo && <CopyField label="Payable to" value={finance.checkByMail.payableTo} />}
          {finance.checkByMail.mailingAddress && <CopyField label="Mailing address" value={finance.checkByMail.mailingAddress} />}
          {finance.checkByMail.memo && <p className="text-xs" style={{ color: c.muted }}>Memo: {finance.checkByMail.memo}</p>}
        </div>
      )}

      {hasDafDetails(finance) && (
        <div className="rounded-xl p-5 space-y-3" style={{ border: `1px solid ${c.borderLight}` }}>
          <h4 className="text-sm font-semibold" style={{ color: c.text }}>Donor-Advised Fund (DAF)</h4>
          {finance.donorAdvisedFund.searchName && <CopyField label="Search name" value={finance.donorAdvisedFund.searchName} />}
          {finance.donorAdvisedFund.ein && <CopyField label="EIN" value={finance.donorAdvisedFund.ein} />}
          {finance.donorAdvisedFund.note && <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{finance.donorAdvisedFund.note}</p>}
        </div>
      )}

      {finance.stockAndSecurities.note.trim() && (
        <div className="rounded-xl p-5" style={{ border: `1px solid ${c.borderLight}` }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Stock / Securities</h4>
          <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{finance.stockAndSecurities.note}</p>
        </div>
      )}

      {finance.financeEmail && (
        <a
          href={financeReceiptMailto(finance.financeEmail, "Alternative gift", amount)}
          className="flex items-center justify-center gap-2 text-xs font-semibold py-2"
          style={{ color: "#6E9277" }}
        >
          <Mail size={14} /> Contact finance for transfer instructions or receipts
        </a>
      )}
    </div>
  );
}

export function DonationSuccessBanner() {
  const c = useDonationColors();
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto mb-6 rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}
    >
      <div className="px-5 py-4 flex items-start gap-3" style={{ backgroundColor: "#6E9277", color: "#fff" }}>
        <CheckCircle2 size={22} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm" style={{ fontFamily: "'Francois One', sans-serif" }}>
            Thank you for your gift
          </p>
          <p className="text-sm text-white/90 mt-1">
            Your payment was received. A thank-you email from One By One Ministries is on its way, and our team has been notified.
          </p>
        </div>
      </div>
      <div className="px-5 py-4 text-sm" style={{ color: c.muted }}>
        Your support helps rebuild communities in the DRC through education, entrepreneurship, and discipleship.
      </div>
    </motion.div>
  );
}

export function DonationCancelledBanner() {
  const c = useDonationColors();
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto mb-6 rounded-2xl p-5"
      style={{ backgroundColor: c.white, border: `1px solid ${c.borderLight}`, color: c.text }}
    >
      <p className="font-semibold text-sm">Checkout was cancelled.</p>
      <p className="text-sm mt-1" style={{ color: c.muted }}>No card payment was completed. You can try again below.</p>
    </motion.div>
  );
}
