"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useColors } from "../../lib/themeStore";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Heart, Shield, Users, BookOpen, Droplets, Quote,
  CreditCard, Smartphone, Building2, Copy, Wallet,
} from "lucide-react";
import { WaveDivider, AnimatedBlob, DotPattern, Sparkles } from "../components/shared/SvgDecorators";
import PageHero from "../components/shared/PageHero";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import {
  BankPanel,
  DonationSuccessBanner,
  MobilePayPanel,
  OtherPanel,
  StripeCheckoutForm,
  VenmoPanel,
} from "@/site/app/components/donate/payment-panels";
import { SECTION_PY } from "../../lib/pageLayout";

const IMPACT_ITEMS = [
  { amount: 25, label: "Feeds a family for one week", icon: Heart },
  { amount: 50, label: "Provides school supplies for one child", icon: BookOpen },
  { amount: 100, label: "Funds a month of village ministry", icon: Users },
  { amount: 250, label: "Sponsors a week of pastoral training", icon: Shield },
  { amount: 500, label: "Builds a community well access point", icon: Droplets },
  { amount: 1000, label: "Funds a classroom for a full school year", icon: BookOpen },
];

const TESTIMONIALS = (localImages: { testimonialOne: string; testimonialTwo: string }) => [
  { quote: "Because of OBOM's support, my daughter has completed three years of school. I never thought I would see this day.", name: "Marie K.", location: "Kinshasa Province, DRC", img: localImages.testimonialOne },
  { quote: "The entrepreneurship training changed everything for my family. I now have a business that provides for my six children.", name: "Solange M.", location: "Kasai Province, DRC", img: localImages.testimonialTwo },
];

const PAYMENT_TABS = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "venmo", label: "Venmo", icon: Smartphone },
  { id: "mobile", label: "Cash App / Zelle", icon: Wallet },
  { id: "bank", label: "Bank Transfer", icon: Building2 },
  { id: "other", label: "Other Methods", icon: Copy },
];

const PRESET_AMOUNTS = ["25", "50", "100", "250", "500"];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.55, ease: "easeOut" } }),
};

function DonatePageContent() {
  const c = useColors();
  const searchParams = useSearchParams();
  const { settings, finance } = useSiteContent();
  const { localImages } = useSiteMedia();
  const donateBanner = useMediaUrl(localImages.donateHero);
  const testimonials = TESTIMONIALS(localImages);
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState("100");
  const [customAmount, setCustomAmount] = useState("");
  const [activeTab, setActiveTab] = useState("card");

  const displayAmount = customAmount || selectedAmount;
  const showSuccess = searchParams.get("status") === "success";

  return (
    <div className="overflow-x-hidden pt-20">
      <PageHero
        imageSrc={donateBanner}
        imageAlt="Hands together"
        eyebrow="Every Gift Matters"
        title={settings.donatePageHeadline || "Give to Change a Life in Congo"}
        bottomColor={c.white}
        size="tall"
        animateImage
        decorative={
          <>
            <DotPattern color="rgba(234,199,154,0.1)" size={20} />
            <Sparkles count={12} color="#EAC79A" className="inset-0" />
            <AnimatedBlob color="#6E9277" opacity={0.1} size={500} className="-top-40 left-0" />
          </>
        }
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-lg sm:text-xl mt-5 max-w-3xl mx-auto leading-relaxed"
          style={{
            color: c.isDark ? "rgba(255,255,255,0.8)" : c.muted,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
          }}
        >
          &quot;Whoever is generous to the poor lends to the Lord, and He will repay him for his deed.&quot; — Proverbs 19:17
        </motion.p>
      </PageHero>

      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <AnimatedBlob color="#6E9277" opacity={0.04} size={500} className="-top-20 right-0" />
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>What Your Gift Does</p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Every Dollar Goes to the Field</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
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

      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DotPattern color="rgba(110,146,119,0.07)" size={24} />
        <AnimatedBlob color="#EAC79A" opacity={0.07} size={500} className="-bottom-20 right-0" />

        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
          {showSuccess && <DonationSuccessBanner />}

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-3 rounded-2xl p-8 shadow-sm" style={{ backgroundColor: c.white }}>
              <h3 className="text-2xl mb-6" style={{ color: c.text }}>Make a Donation</h3>

              <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: `1px solid ${c.borderLight}` }}>
                {(["one-time", "monthly"] as const).map((freq) => (
                  <motion.button key={freq} onClick={() => setFrequency(freq)}
                    className="flex-1 py-3 text-sm font-semibold transition-all"
                    animate={{ backgroundColor: frequency === freq ? "#6E9277" : c.white, color: frequency === freq ? "#ffffff" : c.text }}>
                    {freq === "one-time" ? "One-Time" : "Monthly Recurring"}
                  </motion.button>
                ))}
              </div>

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
                  <input type="number" min={1} placeholder="Custom amount" value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(""); }}
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
                    style={{ color: c.text, backgroundColor: c.cream, borderColor: "rgba(110,146,119,0.3)" }} />
                </div>
              </div>

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
                    {activeTab === "card" && <StripeCheckoutForm amount={displayAmount} frequency={frequency} />}
                    {activeTab === "venmo" && <VenmoPanel amount={displayAmount} frequency={frequency} finance={finance} />}
                    {activeTab === "mobile" && <MobilePayPanel amount={displayAmount} finance={finance} />}
                    {activeTab === "bank" && <BankPanel amount={displayAmount} finance={finance} />}
                    {activeTab === "other" && <OtherPanel amount={displayAmount} finance={finance} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-2 space-y-6">
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
                <p className="text-xs mt-4" style={{ color: c.muted }}>Registered nonprofit · Donation receipts provided by the finance team</p>
              </div>

              {testimonials.map((t, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: c.white }}>
                  <Quote size={16} className="mb-2 opacity-30" style={{ color: "#6E9277" }} />
                  <p className="text-sm leading-relaxed mb-3 text-[#5A4749]" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>{t.quote}</p>
                  <div className="flex items-center gap-2">
                    <img src={t.img} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                    <div><p className="text-xs font-semibold" style={{ color: c.text }}>{t.name}</p><p className="text-xs" style={{ color: c.muted }}>{t.location}</p></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <div className={`max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} text-center`}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h3 className="text-2xl mb-3" style={{ color: c.text }}>Other Ways to Give</h3>
            <p className="text-sm mb-8" style={{ color: c.muted }}>Beyond financial donations, support the mission through prayer, volunteering, or in-kind gifts.</p>
            <div className="grid sm:grid-cols-3 gap-5 lg:gap-6">
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

export default function DonatePage() {
  return (
    <Suspense fallback={null}>
      <DonatePageContent />
    </Suspense>
  );
}
