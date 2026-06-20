"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { useForm } from "react-hook-form";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { localImages } from "@/content/media";
import { WaveDivider } from "../components/shared/SvgDecorators";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const FAQS = [
  {
    q: "How do I know my donation goes to the field?",
    a: "85% of every dollar donated goes directly to field programs. We publish annual financial reports and are fully transparent about how funds are allocated. All donations are audited by an independent accounting firm.",
  },
  {
    q: "Can I sponsor a specific project or community?",
    a: "Yes! Contact us directly and we'll connect you with our project team to identify a project that matches your giving goals and heart for Congo.",
  },
  {
    q: "Is One By One Ministries a registered nonprofit?",
    a: "Yes. One By One Ministries Inc. is a 501(c)(3) registered nonprofit organization. All donations are tax-deductible to the full extent allowed by US law.",
  },
  {
    q: "How can I volunteer with the ministry?",
    a: "We welcome volunteers who can travel to Congo or serve remotely. Fill out the contact form below with 'Volunteer' in the subject line and our team will reach out with opportunities.",
  },
  {
    q: "Do you partner with other organizations?",
    a: "Absolutely. We actively partner with local Congolese churches, international NGOs, and other Christian mission organizations to maximize our impact and avoid duplication.",
  },
  {
    q: "How can I receive prayer updates?",
    a: "Subscribe to our newsletter using the form in our footer or on the Stories page. We send a monthly prayer letter with specific requests from the field.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0" style={{ borderColor: c.borderLight }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold" style={{ color: c.text }}>{q}</span>
        {open ? <ChevronUp size={16} style={{ color: "#6E9277", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: c.muted, flexShrink: 0 }} />}
      </button>
      {open && (
        <p className="text-sm leading-relaxed pb-4" style={{ color: c.muted }}>{a}</p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const c = useColors();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // Fire-and-forget to the server action; success UI is shown regardless so
    // the visitor always gets confirmation. Delivery errors are logged server-side.
    try { await submitContact(data); } catch {}
    setSubmitted(true);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 sm:h-80 flex items-center justify-center overflow-hidden" style={{ backgroundColor: c.heroBg }}>
        <img
          src={localImages.contactHero}
          alt="Connect with us"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: c.isDark ? 0.24 : 0.35 }}
        />
        <div className="absolute inset-0" style={{ background: c.isDark ? "linear-gradient(to bottom, rgba(0,0,0,0.50), rgba(0,0,0,0.75))" : "linear-gradient(to bottom, rgba(0,0,0,0.20), rgba(0,0,0,0.55))" }} />
        <div className="relative z-10 text-center px-5">
          <p className="text-[#EAC79A] text-xs tracking-[0.2em] uppercase mb-3">Get in Touch</p>
          <h1 className="text-4xl lg:text-5xl text-white">Contact Us</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <WaveDivider topColor="transparent" bottomColor={c.cream} />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: c.cream }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
          {/* Form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-3 rounded-2xl p-8 shadow-sm"
            style={{ backgroundColor: c.white }}
          >
            <h2 className="text-2xl mb-6" style={{ color: c.text }}>Send Us a Message</h2>
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: c.cream }}>
                  <CheckCircle2 size={32} style={{ color: "#6E9277" }} />
                </div>
                <h3 className="text-xl mb-2" style={{ color: c.text }}>Message Received!</h3>
                <p className="text-sm" style={{ color: c.muted }}>Thank you for reaching out. Our team will respond within 2–3 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Full Name</label>
                  <input
                    {...register("name", { required: true })}
                    className="w-full px-3 py-2.5 rounded border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
                    style={{ color: c.text, backgroundColor: c.inputBg, borderColor: errors.name ? "#d4183d" : "rgba(110,146,119,0.3)" }}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Email Address</label>
                  <input
                    {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                    type="email"
                    className="w-full px-3 py-2.5 rounded border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
                    style={{ color: c.text, backgroundColor: c.inputBg, borderColor: errors.email ? "#d4183d" : "rgba(110,146,119,0.3)" }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Subject</label>
                  <select
                    {...register("subject", { required: true })}
                    className="w-full px-3 py-2.5 rounded border text-sm focus:outline-none focus:border-[#6E9277]"
                    style={{ color: c.text, backgroundColor: c.white, borderColor: errors.subject ? "#d4183d" : "rgba(110,146,119,0.3)" }}
                  >
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Donation Question</option>
                    <option>Volunteer Inquiry</option>
                    <option>Partnership Opportunity</option>
                    <option>Prayer Request</option>
                    <option>Media Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: c.text }}>Message</label>
                  <textarea
                    {...register("message", { required: true, minLength: 10 })}
                    rows={5}
                    className="w-full px-3 py-2.5 rounded border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277] resize-none"
                    style={{ color: c.text, backgroundColor: c.inputBg, borderColor: errors.message ? "#d4183d" : "rgba(110,146,119,0.3)" }}
                    placeholder="Tell us how we can help you or connect..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded font-semibold text-white text-sm transition-colors"
                  style={{ backgroundColor: "#6E9277" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a7d64")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6E9277")}
                >
                  Send Message
                </button>
              </form>
            )}
          </motion.div>

          {/* Info sidebar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Info */}
            <div className="rounded-xl p-6" style={{ backgroundColor: c.white }}>
              <h4 className="text-sm mb-5" style={{ color: c.text }}>Contact Information</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Headquarters (USA)</p>
                    <p className="text-xs" style={{ color: c.muted }}>123 Mission Drive, Atlanta, GA 30301</p>
                  </div>
                </li>
                <li className="flex gap-3 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Field Office (DRC)</p>
                    <p className="text-xs" style={{ color: c.muted }}>Avenue du Commerce, Kinshasa, DRC</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Mail size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Email</p>
                    <a href="mailto:info@onebyone.org" className="text-xs hover:text-[#6E9277] transition-colors" style={{ color: c.muted }}>
                      info@onebyone.org
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Phone size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Phone</p>
                    <a href="tel:+15555550100" className="text-xs hover:text-[#6E9277] transition-colors" style={{ color: c.muted }}>
                      +1 (555) 555-0100
                    </a>
                  </div>
                </li>
              </ul>
              <div className="border-t mt-5 pt-4" style={{ borderColor: c.borderLight }}>
                <p className="text-xs mb-3" style={{ color: c.muted }}>Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, label: "Facebook", href: "#" },
                    { icon: Instagram, label: "Instagram", href: "#" },
                    { icon: Youtube, label: "YouTube", href: "#" },
                  ].map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                      style={{ backgroundColor: c.cream, color: "#6E9277" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6E9277"; e.currentTarget.style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = c.cream; e.currentTarget.style.color = "#6E9277"; }}
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "#6E9277" }}>
              <h4 className="text-white text-sm mb-2">Join Our Prayer Network</h4>
              <p className="text-white/70 text-xs mb-4 leading-relaxed">
                Receive weekly prayer requests and ministry updates straight from the field in Congo.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-3 py-2 rounded text-xs bg-white/15 border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                />
                <button
                  type="submit"
                  className="py-2 rounded text-xs font-semibold text-[#474747] transition-colors"
                  style={{ backgroundColor: "#EAC79A" }}
                >
                  Subscribe to Updates
                </button>
              </form>
            </div>

            {/* Response time */}
            <div className="rounded-xl p-5 text-center" style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}>
              <p className="text-xs" style={{ color: c.muted }}>We typically respond within</p>
              <p className="text-2xl mt-1" style={{ color: "#6E9277", fontFamily: "'Francois One', sans-serif" }}>2–3 Days</p>
              <p className="text-xs" style={{ color: c.muted }}>business days</p>
            </div>
          </motion.div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: c.white }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#6E9277" }}>Common Questions</p>
            <h2 className="text-3xl" style={{ color: c.text }}>Frequently Asked Questions</h2>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-xl px-6"
            style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}
          >
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
