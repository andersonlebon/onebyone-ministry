"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { useColors } from "../../lib/themeStore";
import { ArrowRight } from "lucide-react";
import { WaveDivider, AnimatedBlob, DotPattern, CrossPattern } from "../components/shared/SvgDecorators";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import type { SiteMediaBundle } from "@/lib/media/types";
import { SECTION_PY } from "../../lib/pageLayout";
import { SectionEditor } from "../components/admin-edit/SectionEditor";

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

const LEADERS = (localImages: SiteMediaBundle["localImages"]) => [
  {
    name: "Rev. Emmanuel Tshilobo",
    role: "Executive Director & Co-Founder",
    bio: "Born in the DRC, Emmanuel has served in ministry for 20+ years with a heart for reconciling the church with its community calling.",
    img: localImages.leaderOne,
    region: "DRC & USA",
  },
  {
    name: "Grace Tshilobo",
    role: "Director of Programs & Co-Founder",
    bio: "Grace brings expertise in women's development, entrepreneurship education, and cross-cultural program design.",
    img: localImages.leaderTwo,
    region: "USA",
  },
  {
    name: "Jonathan Kalala",
    role: "Community Development Lead",
    bio: "A native of Kasai Province, Jonathan builds relationships with village leaders so every project is community-owned.",
    img: localImages.leaderThree,
    region: "DRC",
  },
];

export default function AboutPage() {
  const c = useColors();
  const { settings } = useSiteContent();
  const { localImages, websiteUseImages } = useSiteMedia();
  const aboutBanner = useMediaUrl(websiteUseImages.about);
  const leaders = LEADERS(localImages);

  return (
    <div className="overflow-x-hidden">
      <SectionEditor
        title="About page banner"
        fields={[
          {
            kind: "image",
            path: ["websiteUseImages", "about"],
            label: "Top photo on About page",
            help: "Choose a photo where the village or people are clearly visible. This saves to the live site automatically.",
          },
        ]}
      >
        <section className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden" style={{ backgroundColor: c.heroBg }}>
          <div className="absolute inset-0">
            <motion.img
              src={aboutBanner}
              alt="Ministry community"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 40%", opacity: c.isDark ? 0.35 : 0.45 }}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: c.isDark
                ? "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.25), rgba(0,0,0,0.7))"
                : "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent, rgba(0,0,0,0.55))",
            }}
          />
          <div className="relative z-10 text-center px-5">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ color: "#EAC79A" }}
            >
              Who We Are
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl lg:text-6xl text-white"
            >
              About One By One Ministries
            </motion.h1>
          </div>
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <WaveDivider topColor="transparent" bottomColor={c.cream} />
          </div>
        </section>
      </SectionEditor>

      <SectionEditor
        title="How we began"
        fields={[{ kind: "text", key: "missionStatement", label: "Short mission / intro text", multiline: true }]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <CrossPattern color="rgba(110,146,119,0.05)" />
          <div className={`max-w-3xl mx-auto px-5 sm:px-8 ${SECTION_PY} relative z-10 text-center`}>
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
              How We Began
            </p>
            <h2 className="text-3xl lg:text-4xl mb-6 leading-tight" style={{ color: c.text }}>
              A simple calling in Congo
            </h2>
            <p className="leading-relaxed mb-4 text-base sm:text-lg" style={{ color: c.muted }}>
              One By One Ministries began with a calling to walk with communities in the Democratic Republic of Congo.
              Transformation happens one person, one family, and one village at a time through education, entrepreneurship,
              and spiritual discipleship.
            </p>
            {settings.missionStatement ? (
              <p className="leading-relaxed text-base border-l-4 pl-4 text-left" style={{ color: c.text, borderColor: "#6E9277" }}>
                {settings.missionStatement}
              </p>
            ) : null}
          </div>
          <WaveDivider topColor={c.cream} bottomColor={c.white} />
        </section>
      </SectionEditor>

      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <DotPattern color="rgba(110,146,119,0.06)" size={24} />
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>Our People</p>
            <h2 className="text-3xl lg:text-4xl" style={{ color: c.text }}>Founders, board &amp; team</h2>
            <p className="mt-3 text-sm max-w-2xl mx-auto" style={{ color: c.muted }}>
              Leadership in the USA and a team on the ground in the DRC Congo, working together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {leaders.map((person, i) => (
              <motion.div
                key={person.name}
                custom={i}
                variants={fadeSlide}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 w-36 h-36 rounded-full overflow-hidden" style={{ backgroundColor: c.cream }}>
                  <img src={person.img} alt={person.name} className="w-full h-full object-cover" style={{ objectPosition: "center top" }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#6E9277" }}>
                  {person.region}
                </p>
                <h3 className="text-lg mb-1" style={{ color: c.text }}>{person.name}</h3>
                <p className="text-sm font-semibold mb-2" style={{ color: "#6E9277" }}>{person.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{person.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <WaveDivider topColor={c.white} bottomColor="#6E9277" />
      </section>

      <section className="relative overflow-hidden" style={{ backgroundColor: "#6E9277" }}>
        <AnimatedBlob color="#ffffff" opacity={0.06} size={400} className="-top-20 right-0" />
        <div className={`max-w-3xl mx-auto px-5 text-center ${SECTION_PY} relative z-10`}>
          <h2 className="text-3xl lg:text-4xl text-white mb-4">Pray with us. Partner with us.</h2>
          <p className="text-white/85 mb-8">Every gift and every prayer helps the work in Congo.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold"
              style={{ backgroundColor: "#EAC79A", color: "#474747" }}
            >
              Give here <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white border border-white/40"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
