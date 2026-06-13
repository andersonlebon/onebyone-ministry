"use client";

import { useState } from "react";
import Link from "next/link";
import { useColors } from "../../lib/themeStore";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useForm } from "react-hook-form";
import {
  Heart, Shield, Users, BookOpen, Droplets, CheckCircle2, Quote,
  CreditCard, Smartphone, Building2, Copy, ExternalLink,
} from "lucide-react";
import { WaveDivider, AnimatedBlob, DotPattern, Sparkles } from "../components/shared/SvgDecorators";

const IMPACT_ITEMS = [
  { amount: 25, label: "Feeds a family for one week", icon: Heart },
  { amount: 50, label: "Provides school supplies for one child", icon: BookOpen },
  { amount: 100, label: "Funds a month of village ministry", icon: Users },
  { amount: 250, label: "Sponsors a week of pastoral training", icon: Shield },
  { amount: 500, label: "Builds a community well access point", icon: Droplets },
  { amount: 1000, label: "Funds a classroom for a full school year", icon: BookOpen },
];

const TESTIMONIALS = [
  { quote: "Because of OBOM's support, my daughter has completed three years of school. I never thought I would see this day.", name: "Marie K.", location: "Kinshasa Province, DRC", img: "https://images.unsplash.com/photo-1632215861513-130b66fe97f4?w=80&h=80&fit=crop&auto=format" },
  { quote: "The entrepreneurship training changed everything for my family. I now have a business that provides for my six children.", name: "Solange M.", location: "Kasai Province, DRC", img: "https://images.unsplash.com/photo-1547496613-4e19af6736dc?w=80&h=80&fit=crop&auto=format" },
];

const PAYMENT_TABS = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: ExternalLink },
  { id: "mobile", label: "Mobile Pay", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
  { id: "other", label: "Other Methods", icon: Copy },
];

const PRESET_AMOUNTS = ["25", "50", "100", "250", "500"];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.55, ease: "easeOut" } }),
};

function CardPaymentForm({ amount, frequency }: { amount: string; frequency: string }) {
  const c = useColors();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onSubmit = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setSubmitted(true); }, 2000);
  };

  if (submitted) return (
    <div className="text-center py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: c.cream }}>
          <CheckCircle2 size={32} style={{ color: "#6E9277" }} />
        </div>
      </motion.div>
      <h3 className="text-xl mb-2" style={{ color: c.text }}>Thank you for your gift!</h3>
      <p className="text-sm" style={{ color: c.muted }}>Your {frequency} gift of <strong>${amount}</strong> is changing lives in Congo. Confirmation sent to your email.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Card Number</label>
        <div className="relative">
          <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.muted }} />
          <input {...register("cardNumber", { required: true })}
            placeholder="1234 5678 9012 3456"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
            style={{ color: c.text, backgroundColor: c.inputBg, borderColor: errors.cardNumber ? "#d4183d" : "rgba(110,146,119,0.3)" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Expiry Date</label>
          <input {...register("expiry", { required: true })} placeholder="MM / YY"
            className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
            style={{ color: c.text, borderColor: errors.expiry ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>CVV</label>
          <input {...register("cvv", { required: true })} placeholder="123"
            className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
            style={{ color: c.text, borderColor: errors.cvv ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
        </div>
      </div>
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
        <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Email</label>
        <input {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })} type="email" placeholder="your@email.com"
          className="w-full px-3 py-2.5 rounded-lg border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
          style={{ color: c.text, borderColor: errors.email ? "#d4183d" : "rgba(110,146,119,0.3)" }} />
      </div>
      <motion.button
        type="submit"
        disabled={processing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        style={{ backgroundColor: "#6E9277" }}
      >
        {processing ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <><Heart size={17} /> Give ${amount || "0"} {frequency === "monthly" ? "/ Month" : ""}</>
        )}
      </motion.button>
      <div className="flex items-center justify-center gap-4 mt-2">
        {["visa", "mastercard", "amex", "discover"].map((card) => (
          <div key={card} className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ color: c.muted, border: `1px solid ${c.borderLight}` }}>{card.slice(0, 4)}</div>
        ))}
      </div>
      <p className="text-xs text-center flex items-center justify-center gap-1" style={{ color: c.muted }}>
        <Shield size={11} /> 256-bit SSL secured · 100% goes to field · Tax-deductible
      </p>
    </form>
  );
}

function PayPalPanel({ amount, frequency }: { amount: string; frequency: string }) {
  const c = useColors();
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: c.cream }}>
        <p className="text-sm mb-1" style={{ color: c.muted }}>You are giving</p>
        <p className="text-2xl" style={{ color: c.text, fontFamily: "'Francois One', sans-serif" }}>${amount || "0"} {frequency === "monthly" ? "/ mo" : ""}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.open("https://paypal.com", "_blank")}
        className="w-full py-4 rounded-xl font-bold text-[#003087] text-lg flex items-center justify-center gap-2"
        style={{ backgroundColor: "#FFD140" }}
      >
        <span style={{ color: "#009CDE", fontWeight: 800 }}>Pay</span>
        <span style={{ color: "#003087", fontWeight: 800 }}>Pal</span>
      </motion.button>
      <p className="text-xs text-center" style={{ color: c.muted }}>You'll be redirected to PayPal to complete your secure donation.</p>
      <p className="text-xs text-center" style={{ color: c.muted }}>PayPal also supports recurring monthly giving.</p>
    </div>
  );
}

function MobilePayPanel({ amount }: { amount: string }) {
  const c = useColors();
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: c.muted }}>Choose your preferred mobile payment method:</p>
      {[
        { name: "Apple Pay", color: "#000000", textColor: "#ffffff", icon: "🍎" },
        { name: "Google Pay", color: "#ffffff", textColor: "#000000", border: `1px solid ${c.borderLight}`, icon: "G" },
        { name: "Cash App", color: "#00D64F", textColor: "#ffffff", icon: "$" },
        { name: "Venmo", color: "#3D95CE", textColor: "#ffffff", icon: "V" },
        { name: "Zelle", color: "#6B2FAB", textColor: "#ffffff", icon: "Z" },
      ].map((method) => (
        <motion.button
          key={method.name}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3"
          style={{ backgroundColor: method.color, color: method.textColor, border: (method as any).border }}
        >
          <span className="text-lg">{method.icon}</span>
          {method.name} — ${amount || "0"}
        </motion.button>
      ))}
      <div className="rounded-xl p-4 text-xs mt-2" style={{ border: `1px solid ${c.borderLight}`, color: c.muted }}>
        <p className="font-semibold mb-1" style={{ color: c.text }}>Cash App / Venmo / Zelle</p>
        <p>Send to: <strong>@OneByOneMinistries</strong> or <strong>info@onebyone.org</strong></p>
        <p className="mt-1 text-[#6E9277]">Please include "DONATION" in the memo.</p>
      </div>
    </div>
  );
}

function BankPanel({ amount }: { amount: string }) {
  const c = useColors();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  const fields = [
    { label: "Bank Name", value: "First Community Bank" },
    { label: "Account Name", value: "One By One Ministries Inc." },
    { label: "Routing Number", value: "021000021" },
    { label: "Account Number", value: "4887712930" },
    { label: "Swift / BIC", value: "BOFAUS3N" },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: c.cream }}>
        <p className="text-xs mb-1" style={{ color: c.muted }}>Donation Amount</p>
        <p className="text-2xl" style={{ color: c.text, fontFamily: "'Francois One', sans-serif" }}>${amount || "0"}</p>
      </div>
      <p className="text-xs mb-3" style={{ color: c.muted }}>Use the details below for a direct bank transfer (ACH or wire):</p>
      {fields.map((f) => (
        <div key={f.label} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}>
          <div>
            <p className="text-xs" style={{ color: c.muted }}>{f.label}</p>
            <p className="text-sm font-semibold" style={{ color: c.text }}>{f.value}</p>
          </div>
          <button onClick={() => copy(f.value, f.label)} className="hover:text-[#6E9277] transition-colors" style={{ color: c.muted }}>
            {copied === f.label ? <CheckCircle2 size={15} style={{ color: "#6E9277" }} /> : <Copy size={15} />}
          </button>
        </div>
      ))}
      <p className="text-xs mt-2 text-center" style={{ color: c.muted }}>Please email <span style={{ color: "#6E9277" }}>finance@onebyone.org</span> after your transfer so we can send your tax receipt.</p>
    </div>
  );
}

function OtherPanel() {
  const c = useColors();
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5" style={{ border: `1px solid ${c.borderLight}` }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Cryptocurrency</h4>
        <div className="space-y-3">
          {[
            { coin: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
            { coin: "Ethereum (ETH)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
          ].map((coin) => (
            <div key={coin.coin}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#6E9277" }}>{coin.coin}</p>
              <p className="text-xs font-mono break-all p-2 rounded" style={{ color: c.muted, backgroundColor: c.cream }}>{coin.address}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ border: `1px solid ${c.borderLight}` }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Check by Mail</h4>
        <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
          Make checks payable to: <strong>One By One Ministries Inc.</strong><br />
          Mail to: 123 Mission Drive, Atlanta, GA 30301<br />
          <span style={{ color: "#6E9277" }}>Include your email for a tax receipt.</span>
        </p>
      </div>
      <div className="rounded-xl p-5" style={{ border: `1px solid ${c.borderLight}` }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Donor-Advised Fund (DAF)</h4>
        <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
          Search for "One By One Ministries Inc." in your DAF portal.<br />
          EIN: <strong>82-1234567</strong><br />
          Questions? Email <span style={{ color: "#6E9277" }}>finance@onebyone.org</span>
        </p>
      </div>
      <div className="rounded-xl p-5" style={{ border: `1px solid ${c.borderLight}` }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: c.text }}>Stock / Securities</h4>
        <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
          To donate appreciated stock, contact us at <span style={{ color: "#6E9277" }}>finance@onebyone.org</span> for DTC transfer details. Donating stock may provide significant tax advantages.
        </p>
      </div>
    </div>
  );
}

export default function DonatePage() {
  const c = useColors();
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState("100");
  const [customAmount, setCustomAmount] = useState("");
  const [activeTab, setActiveTab] = useState("card");

  const displayAmount = customAmount || selectedAmount;

  return (
    <div className="overflow-x-hidden pt-20">

      {/* Hero */}
      <section className="relative py-28 flex items-center justify-center overflow-hidden bg-[#1a2a1f]">
        <motion.img
          src="https://images.unsplash.com/photo-1554566205-d2a9e64cc5e9?w=1400&h=700&fit=crop&auto=format"
          alt="Hands together"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
        <DotPattern color="rgba(234,199,154,0.1)" size={20} />
        <Sparkles count={12} color="#EAC79A" className="inset-0" />
        <AnimatedBlob color="#6E9277" opacity={0.1} size={500} className="-top-40 left-0" />

        <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-[#EAC79A] text-xs tracking-[0.22em] uppercase mb-4">Every Gift Matters</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="text-4xl lg:text-6xl text-white mb-5 leading-tight">Give to Change a Life in Congo</motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="text-white/80 text-xl leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            "Whoever is generous to the poor lends to the Lord, and He will repay him for his deed." — Proverbs 19:17
          </motion.p>
        </div>
        <WaveDivider topColor="transparent" bottomColor={c.white} />
      </section>

      {/* Impact Breakdown */}
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: c.white }}>
        <AnimatedBlob color="#6E9277" opacity={0.04} size={500} className="-top-20 right-0" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>What Your Gift Does</p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Every Dollar Goes to the Field</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {IMPACT_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.amount}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(71,71,71,0.1)" }}
                  transition={{ duration: 0.22 }}
                  className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer group"
                  style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}
                >
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.cream }}>
                    <Icon size={19} style={{ color: "#6E9277" }} />
                  </motion.div>
                  <div>
                    <p className="text-2xl mb-1" style={{ color: "#6E9277", fontFamily: "'Francois One', sans-serif" }}>${item.amount}</p>
                    <p className="text-sm leading-snug" style={{ color: c.muted }}>{item.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <WaveDivider topColor={c.white} bottomColor={c.cream} />
      </section>

      {/* Donation Form + Sidebar */}
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DotPattern color="rgba(110,146,119,0.07)" size={24} />
        <AnimatedBlob color="#EAC79A" opacity={0.07} size={500} className="-bottom-20 right-0" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-5 gap-10 items-start relative z-10">

          {/* Form */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-3 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: c.white }}>
            <h3 className="text-2xl mb-6" style={{ color: c.text }}>Make a Donation</h3>

            {/* Frequency toggle */}
            <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${c.borderLight}` }}>
              {(["one-time", "monthly"] as const).map((freq) => (
                <motion.button key={freq} onClick={() => setFrequency(freq)}
                  className="flex-1 py-3 text-sm font-semibold transition-all"
                  animate={{ backgroundColor: frequency === freq ? "#6E9277" : c.white, color: frequency === freq ? "#ffffff" : c.text }}>
                  {freq === "one-time" ? "One-Time" : "Monthly Recurring"}
                </motion.button>
              ))}
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-3" style={{ color: c.text }}>Amount</label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <motion.button key={amt} onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                    animate={{ backgroundColor: selectedAmount === amt && !customAmount ? "#6E9277" : c.cream, color: selectedAmount === amt && !customAmount ? "#ffffff" : c.text }}>
                    ${amt}
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: c.muted }}>$</span>
                <input type="number" placeholder="Custom amount" value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(""); }}
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
                  style={{ color: c.text, backgroundColor: c.cream, borderColor: "rgba(110,146,119,0.3)" }} />
              </div>
            </div>

            {/* Payment method tabs */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-3" style={{ color: c.text }}>Payment Method</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {PAYMENT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      animate={{ backgroundColor: activeTab === tab.id ? "#6E9277" : c.cream, color: activeTab === tab.id ? "#ffffff" : c.text }}>
                      <Icon size={13} /> {tab.label}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeTab === "card" && <CardPaymentForm amount={displayAmount} frequency={frequency} />}
                  {activeTab === "paypal" && <PayPalPanel amount={displayAmount} frequency={frequency} />}
                  {activeTab === "mobile" && <MobilePayPanel amount={displayAmount} />}
                  {activeTab === "bank" && <BankPanel amount={displayAmount} />}
                  {activeTab === "other" && <OtherPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-2 space-y-6">

            {/* Transparency */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: c.white }}>
              <h4 className="text-sm mb-4 flex items-center gap-2" style={{ color: c.text }}>
                <Shield size={14} style={{ color: "#6E9277" }} /> Financial Transparency
              </h4>
              {[["Direct to Field", "85%"], ["Operations", "10%"], ["Fundraising", "5%"]].map(([label, pct]) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span style={{ color: c.text }}>{label}</span><span style={{ color: "#6E9277" }} className="font-semibold">{pct}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: c.cream }}>
                    <motion.div className="h-2 rounded-full" style={{ backgroundColor: "#6E9277" }}
                      initial={{ width: 0 }} whileInView={{ width: pct }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
                  </div>
                </div>
              ))}
              <p className="text-xs mt-4" style={{ color: c.muted }}>501(c)(3) registered · EIN: 82-1234567 · All donations tax-deductible</p>
            </div>

            {/* Testimonials */}
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: c.white }}>
                <Quote size={16} className="mb-2 opacity-30" style={{ color: "#6E9277" }} />
                <p className="text-sm leading-relaxed mb-3 text-[#5A4749]" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{t.quote}</p>
                <div className="flex items-center gap-2">
                  <img src={t.img} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                  <div><p className="text-xs font-semibold" style={{ color: c.text }}>{t.name}</p><p className="text-xs" style={{ color: c.muted }}>{t.location}</p></div>
                </div>
              </motion.div>
            ))}

            {/* Stats */}
            <div className="rounded-2xl p-6 overflow-hidden relative" style={{ backgroundColor: "#6E9277" }}>
              <DotPattern color="rgba(255,255,255,0.08)" size={18} />
              <AnimatedBlob color="#ffffff" opacity={0.06} size={200} className="-top-10 -right-10" />
              <div className="relative z-10">
                <h4 className="text-white text-sm mb-4">Your Impact in 2024</h4>
                {[["18+", "Communities served"], ["500+", "Families reached"], ["8", "Active education projects"]].map(([num, label]) => (
                  <div key={label} className="flex items-center gap-3 mb-3">
                    <span className="text-2xl text-white" style={{ fontFamily: "'Francois One', sans-serif" }}>{num}</span>
                    <span className="text-white/70 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Other Ways */}
      <section className="py-16" style={{ backgroundColor: c.white }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3 className="text-2xl mb-3" style={{ color: c.text }}>Other Ways to Give</h3>
            <p className="text-sm mb-8" style={{ color: c.muted }}>Beyond financial donations, support the mission through prayer, volunteering, or in-kind gifts.</p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { title: "Prayer Partnership", desc: "Join our prayer team and receive weekly field requests.", cta: "Contact Us" },
                { title: "Volunteer", desc: "Travel to Congo or serve remotely with your skills.", cta: "Learn More" },
                { title: "Legacy Giving", desc: "Include OBOM in your estate planning for lasting impact.", cta: "Contact Us" },
              ].map((item, i) => (
                <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                  whileHover={{ y: -5 }} className="p-6 rounded-2xl text-left" style={{ border: `1px solid ${c.borderLight}` }}>
                  <h4 className="text-sm mb-2" style={{ color: c.text }}>{item.title}</h4>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: c.muted }}>{item.desc}</p>
                  <Link href="/contact" className="text-xs font-semibold" style={{ color: "#6E9277" }}>{item.cta} →</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
