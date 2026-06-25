"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import {
  Heart,
  Shield,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Mail,
} from "lucide-react";

import { parseDonationAmount } from "@/lib/donate/amount";
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
import { useColors } from "@/site/lib/themeStore";

function useDonationColors() {
  return useColors();
}

function AmountError({ amount }: { amount: string }) {
  const c = useDonationColors();
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
        window.location.href = json.url;
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
        Use memo &quot;Donation&quot; on your transfer. Email {finance.financeEmail || "our finance team"} with confirmation for your tax receipt.
      </p>
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
      className="max-w-3xl mx-auto mb-6 rounded-2xl p-5 flex items-start gap-3"
      style={{ backgroundColor: "#6E9277", color: "#fff" }}
    >
      <CheckCircle2 size={22} className="flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-sm">Thank you for your gift!</p>
        <p className="text-sm text-white/85 mt-1">Your donation helps change lives in Congo. A receipt will be emailed when applicable.</p>
      </div>
    </motion.div>
  );
}
