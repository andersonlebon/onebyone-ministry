"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { useForm } from "react-hook-form";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { siteConfig } from "@/lib/site";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import NewsletterSubscribeForm from "../components/shared/NewsletterSubscribeForm";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";
import { SectionEditor } from "../components/admin-edit/SectionEditor";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function ContactPage() {
  const c = useColors();
  const { localImages } = useSiteMedia();
  const contactBanner = useMediaUrl(localImages.contactHero);
  const { settings } = useSiteContent();
  const email = settings.contactEmail || siteConfig.email;
  const phone = settings.contactPhone;
  const socials = [
    { icon: Facebook, label: "Facebook", href: settings.facebookUrl },
    { icon: Instagram, label: "Instagram", href: settings.instagramUrl },
    { icon: Youtube, label: "YouTube", href: settings.youtubeUrl },
  ].filter((s) => s.href);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setStatus("loading");
    setStatusMessage("");
    try {
      const result = await submitContact(data);
      if (result.ok) {
        setStatus("success");
        setStatusMessage(result.message);
      } else {
        setStatus("error");
        setStatusMessage(result.message);
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            if (field === "name" || field === "email" || field === "subject" || field === "message") {
              setError(field, { message });
            }
          }
        }
      }
    } catch {
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again or email contact@onebyoneministries.org directly.");
    }
  };

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={contactBanner}
        imageAlt="Connect with us"
        eyebrow="Get in Touch"
        title="Contact Us"
        bottomColor={c.cream}
        variant="cinematic"
        edit={{
          title: "Contact page banner",
          imagePath: ["localImages", "contactHero"],
          imageLabel: "Background photo",
        }}
      />

      {/* Contact Section */}
      <SectionEditor
        title="Contact details"
        fields={[
          { kind: "text", key: "contactEmail", label: "Email" },
          { kind: "text", key: "contactPhone", label: "Phone" },
          { kind: "text", key: "usaAddress", label: "USA address", multiline: true },
          { kind: "text", key: "congoAddress", label: "Congo address", multiline: true },
          { kind: "text", key: "facebookUrl", label: "Facebook URL" },
          { kind: "text", key: "instagramUrl", label: "Instagram URL" },
          { kind: "text", key: "youtubeUrl", label: "YouTube URL" },
        ]}
      >
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} grid lg:grid-cols-5 gap-10 lg:gap-14 items-start`}>
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
            {status === "success" ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: c.cream }}>
                  <CheckCircle2 size={32} style={{ color: "#6E9277" }} />
                </div>
                <h3 className="text-xl mb-2" style={{ color: c.text }}>Message Received!</h3>
                <p className="text-sm" style={{ color: c.muted }}>{statusMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {status === "error" && statusMessage && (
                  <div className="px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
                    {statusMessage}
                  </div>
                )}
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
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded font-semibold text-white text-sm transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#6E9277" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a7d64")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6E9277")}
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
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
                {settings.usaAddress ? (
                <li className="flex gap-3 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Headquarters (USA)</p>
                    <p className="text-xs whitespace-pre-line" style={{ color: c.muted }}>{settings.usaAddress}</p>
                  </div>
                </li>
                ) : null}
                {settings.congoAddress ? (
                <li className="flex gap-3 text-sm">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Field Office (DRC)</p>
                    <p className="text-xs whitespace-pre-line" style={{ color: c.muted }}>{settings.congoAddress}</p>
                  </div>
                </li>
                ) : null}
                <li className="flex gap-3">
                  <Mail size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Email</p>
                    <a href={`mailto:${email}`} className="text-xs hover:text-[#6E9277] transition-colors" style={{ color: c.muted }}>
                      {email}
                    </a>
                  </div>
                </li>
                {phone && (
                <li className="flex gap-3">
                  <Phone size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#6E9277" }} />
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: c.text }}>Phone</p>
                    <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-xs hover:text-[#6E9277] transition-colors" style={{ color: c.muted }}>
                      {phone}
                    </a>
                  </div>
                </li>
                )}
              </ul>
              <div className="border-t mt-5 pt-4" style={{ borderColor: c.borderLight }}>
                <p className="text-sm font-semibold mb-3" style={{ color: c.text }}>Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {socials.length === 0 ? (
                    <p className="text-xs" style={{ color: c.muted }}>Social links can be added in Site Settings.</p>
                  ) : (
                    socials.map(({ icon: Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
                        style={{ backgroundColor: "#6E9277", color: "#ffffff" }}
                      >
                        <Icon size={18} /> {label}
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "#6E9277" }}>
              <h4 className="text-white text-sm mb-2">Join Our Prayer Network</h4>
              <p className="text-white/70 text-xs mb-4 leading-relaxed">
                Receive weekly prayer requests and ministry updates straight from the field in Congo.
              </p>
              <NewsletterSubscribeForm
                inputClassName="px-3 py-2 rounded text-xs bg-white/15 border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                buttonClassName="py-2 rounded text-xs font-semibold text-[#474747] bg-[#EAC79A]"
              />
            </div>

            {/* Response time */}
            <div className="rounded-xl p-5 text-center" style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}>
              <p className="text-xs" style={{ color: c.muted }}>We typically respond within</p>
              <p className="text-2xl mt-1" style={{ color: "#6E9277", fontFamily: "'Francois One', sans-serif" }}>2–3 Days</p>
              <p className="text-xs" style={{ color: c.muted }}>business days</p>
            </div>
          </motion.div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.footer} />
      </section>
      </SectionEditor>
    </div>
  );
}
