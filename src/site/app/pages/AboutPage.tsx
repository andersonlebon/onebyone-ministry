"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { ArrowRight, Globe, Heart } from "lucide-react";
import { useColors } from "../../lib/themeStore";
import {
  WaveDivider,
  AnimatedBlob,
  DotPattern,
  CrossPattern,
  DiagonalStripes,
} from "../components/shared/SvgDecorators";
import FoundersTree from "../components/shared/FoundersTree";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { aboutIcon } from "@/site/lib/aboutIcons";
import { SECTION_PY } from "../../lib/pageLayout";
import { SectionEditor } from "../components/admin-edit/SectionEditor";
import { AboutContentEditor } from "../components/admin-edit/AboutContentEditor";
import { InlineTeamEditor } from "../components/admin-edit/InlineTeamEditor";

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  const c = useColors();
  const { settings, about } = useSiteContent();
  const { localImages, websiteUseImages, aboutStoryImages } = useSiteMedia();
  const aboutBanner = useMediaUrl(websiteUseImages.about);

  const fallbackLeaders = [localImages.leaderOne, localImages.leaderTwo, localImages.leaderThree];
  const team = [...about.team]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((person, i) => ({
      ...person,
      img: person.img || fallbackLeaders[i] || "",
    }));

  const storyImages = [
    aboutStoryImages[0] || localImages.community,
    aboutStoryImages[1] || localImages.communityAlt,
    aboutStoryImages[2] || localImages.leaderOne,
  ];

  return (
    <div className="overflow-x-hidden">
      <SectionEditor
        title="About page banner"
        placement="hero"
        buttonLabel="Edit banner"
        fields={[
          {
            kind: "image",
            path: ["websiteUseImages", "about"],
            label: "Background photo",
            help: "Choose a photo where the village or people are clearly visible. This saves to the live site automatically.",
          },
        ]}
      >
        <section
          className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: c.heroBg }}
        >
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

      {/* Our Story */}
      <AboutContentEditor
        title="Our story"
        fields={[
          { key: "storyEyebrow", label: "Eyebrow" },
          { key: "storyTitle", label: "Title" },
          { key: "storyBody1", label: "First paragraph", multiline: true },
          { key: "storyBody2", label: "Second paragraph", multiline: true },
          { key: "storyQuote", label: "Quote", multiline: true },
        ]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <CrossPattern color="rgba(110,146,119,0.06)" />
          <AnimatedBlob color="#EAC79A" opacity={0.07} size={500} className="-top-20 right-0" />

          <div
            className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} grid lg:grid-cols-2 gap-14 lg:gap-20 items-center relative z-10`}
          >
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
                {about.storyEyebrow}
              </p>
              <h2 className="text-3xl lg:text-5xl mb-6 leading-tight" style={{ color: c.text }}>
                {about.storyTitle}
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
                {about.storyBody1}
              </p>
              <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
                {about.storyBody2}
              </p>
              {settings.missionStatement ? (
                <p
                  className="text-base leading-relaxed mb-4 border-l-4 pl-4"
                  style={{
                    borderColor: "#6E9277",
                    color: c.text,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                  }}
                >
                  {settings.missionStatement}
                </p>
              ) : null}
              <p
                className="text-lg leading-relaxed mb-7 border-l-4 pl-4"
                style={{
                  borderColor: "#EAC79A",
                  color: c.text,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                }}
              >
                {about.storyQuote}
              </p>
              <Link href="/donate">
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: "#5a7d64" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: "#6E9277" }}
                >
                  Support the Work <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { src: storyImages[0], className: "col-span-2 h-52 rounded-2xl object-cover w-full" },
                { src: storyImages[1], className: "h-40 rounded-2xl object-cover w-full" },
                { src: storyImages[2], className: "h-40 rounded-2xl object-cover w-full" },
              ].map((img, i) => (
                <motion.div
                  key={i}
                  className={i === 0 ? "col-span-2 overflow-hidden rounded-2xl" : "overflow-hidden rounded-2xl"}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={img.src} alt="" className={img.className} />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <WaveDivider topColor={c.cream} bottomColor={c.white} />
        </section>
      </AboutContentEditor>

      {/* Vision & Mission */}
      <AboutContentEditor
        title="Vision & mission"
        fields={[
          { key: "visionText", label: "Vision", multiline: true },
          { key: "missionText", label: "Mission", multiline: true },
        ]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
          <DiagonalStripes color="rgba(110,146,119,0.04)" />
          <AnimatedBlob color="#5A4749" opacity={0.04} size={500} className="-bottom-40 -right-40" />

          <div
            className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} grid lg:grid-cols-2 gap-8 lg:gap-10 relative z-10`}
          >
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl p-9"
              style={{ border: `1px solid ${c.borderLight}` }}
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: c.cream }}
              >
                <Globe size={22} style={{ color: "#6E9277" }} />
              </motion.div>
              <h3 className="text-2xl mb-4" style={{ color: c.text }}>
                Our Vision
              </h3>
              <p
                className="text-lg leading-relaxed"
                style={{ color: c.text, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
              >
                {about.visionText}
              </p>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl p-9"
              style={{ backgroundColor: "#6E9277" }}
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-white/20"
              >
                <Heart size={22} className="text-white" />
              </motion.div>
              <h3 className="text-2xl text-white mb-4">Our Mission</h3>
              <p
                className="text-lg text-white/90 leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
              >
                {about.missionText}
              </p>
            </motion.div>
          </div>
        </section>
      </AboutContentEditor>

      <FoundersTree />

      {/* Core Values */}
      <AboutContentEditor
        title="Core values headings"
        fields={[
          { key: "valuesEyebrow", label: "Eyebrow" },
          { key: "valuesTitle", label: "Title" },
        ]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <DotPattern color="rgba(110,146,119,0.08)" size={22} />
          <AnimatedBlob color="#6E9277" opacity={0.06} size={600} className="-top-40 left-0" />

          <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
                {about.valuesEyebrow}
              </p>
              <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>
                {about.valuesTitle}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
              {about.values.map((val, i) => {
                const Icon = aboutIcon(val.icon);
                return (
                  <motion.div
                    key={val.id}
                    custom={i}
                    variants={fadeSlide}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(71,71,71,0.1)" }}
                    transition={{ duration: 0.25 }}
                    className="text-center p-6 rounded-2xl cursor-pointer"
                    style={{ border: `1px solid ${c.borderLight}`, backgroundColor: c.white }}
                  >
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: c.cream }}
                    >
                      <Icon size={20} style={{ color: "#6E9277" }} />
                    </motion.div>
                    <h4 className="text-sm mb-2" style={{ color: c.text }}>
                      {val.title}
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
                      {val.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <WaveDivider topColor={c.cream} bottomColor={c.white} />
        </section>
      </AboutContentEditor>

      {/* Leadership / Team */}
      <InlineTeamEditor>
        <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
          <CrossPattern color="rgba(110,146,119,0.04)" />
          <AnimatedBlob color="#EAC79A" opacity={0.06} size={500} className="-top-20 -right-20" />

          <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
                {about.teamEyebrow}
              </p>
              <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>
                {about.teamTitle}
              </h2>
              <p className="mt-3 text-sm max-w-2xl mx-auto" style={{ color: c.muted }}>
                {about.teamIntro}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {team.map((leader, i) => (
                <motion.div
                  key={leader.id}
                  custom={i}
                  variants={fadeSlide}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: c.white,
                    boxShadow: "0 2px 24px rgba(71,71,71,0.07)",
                    border: "1px solid rgba(110,146,119,0.12)",
                  }}
                >
                  <div className="overflow-hidden h-64" style={{ backgroundColor: c.cream }}>
                    {leader.img ? (
                      <motion.img
                        src={leader.img}
                        alt={leader.name}
                        className="w-full h-full object-cover object-top"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "#6E9277" }}
                    >
                      {leader.region}
                    </p>
                    <h3 className="text-base mb-0.5" style={{ color: c.text }}>
                      {leader.name}
                    </h3>
                    <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: "#6E9277" }}>
                      {leader.role}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: c.muted }}>
                      {leader.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <WaveDivider topColor={c.white} bottomColor={c.cream} />
        </section>
      </InlineTeamEditor>

      {/* Why Congo */}
      <AboutContentEditor
        title="Why Congo"
        fields={[
          { key: "whyCongoEyebrow", label: "Eyebrow" },
          { key: "whyCongoTitle", label: "Title" },
          { key: "whyCongoBody1", label: "First paragraph", multiline: true },
          { key: "whyCongoBody2", label: "Second paragraph", multiline: true },
        ]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <DiagonalStripes color="rgba(110,146,119,0.05)" />
          <AnimatedBlob color="#6E9277" opacity={0.07} size={500} className="-bottom-20 right-0" />

          <div
            className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10`}
          >
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <motion.img
                  src={localImages.communityAlt}
                  alt="Children in the DRC"
                  className="w-full h-80 object-cover"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </motion.div>
            <motion.div
              custom={1}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
                {about.whyCongoEyebrow}
              </p>
              <h2 className="text-3xl lg:text-4xl mb-6 leading-tight" style={{ color: c.text }}>
                {about.whyCongoTitle}
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
                {about.whyCongoBody1}
              </p>
              <p className="leading-relaxed mb-6" style={{ color: c.muted }}>
                {about.whyCongoBody2}
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/projects">
                  <motion.button
                    whileHover={{ scale: 1.04, backgroundColor: "#5a7d64" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ backgroundColor: "#6E9277" }}
                  >
                    See Our Work
                  </motion.button>
                </Link>
                <Link href="/donate">
                  <motion.button
                    whileHover={{ scale: 1.04, backgroundColor: "#6E9277", color: "white" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 rounded-xl font-semibold text-sm border transition-colors"
                    style={{ borderColor: "#6E9277", color: "#6E9277" }}
                  >
                    Give Now
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
          <WaveDivider topColor={c.cream} bottomColor="#6E9277" />
        </section>
      </AboutContentEditor>

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
