"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useColors } from "../../lib/themeStore";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  Heart, Shield,
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
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState("100");
  const [customAmount, setCustomAmount] = useState("");
  const [activeTab, setActiveTab] = useState("card");

  const displayAmount = customAmount || selectedAmount;
  const showSuccess = searchParams.get("status") === "success";

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={donateBanner}
        imageAlt="Partner with One By One Ministries"
        eyebrow="Partner With Us"
        title={settings.donatePageHeadline || "Partner With Us"}
        bottomColor={c.cream}
        size="tall"
        animateImage
        edit={{
          title: "Donate page banner",
          imagePath: ["localImages", "donateHero"],
          imageLabel: "Background photo",
          textFields: [{ key: "donatePageHeadline", label: "Page headline" }],
        }}
        decorative={
          <>
            <DotPattern color="rgba(255,255,255,0.12)" size={20} />
            <Sparkles count={8} color="rgba(255,255,255,0.5)" className="inset-0" />
            <AnimatedBlob color="#6E9277" opacity={0.1} size={500} className="-top-40 left-0" />
          </>
        }
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-lg sm:text-xl mt-5 max-w-3xl mx-auto leading-relaxed text-white/90"
        >
          Every gift goes to the field. Every dollar helps.
        </motion.p>
      </PageHero>

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
                <h4 className="text-sm mb-3 flex items-center gap-2" style={{ color: c.text }}>
                  <Shield size={14} style={{ color: "#6E9277" }} /> Where your gift goes
                </h4>
                <p className="text-sm leading-relaxed mb-3" style={{ color: c.muted }}>
                  Every gift goes to the field in Congo. We do not split donations across marketing categories.
                </p>
                <p className="text-xs" style={{ color: c.muted }}>
                  Registered nonprofit · Donation receipts provided by the finance team
                </p>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: "#6E9277" }}>
                <Heart size={20} className="text-[#EAC79A] mb-3" />
                <h4 className="text-white text-lg mb-2">Every dollar helps</h4>
                <p className="text-white/85 text-sm leading-relaxed">
                  Give any amount. Your partnership supports the work on the ground, one person and one community at a time.
                </p>
              </div>
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
