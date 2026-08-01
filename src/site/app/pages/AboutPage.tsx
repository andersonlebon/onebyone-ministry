"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Globe, Heart, MapPin } from "lucide-react";
import { useColors } from "../../lib/themeStore";
import {
  WaveDivider,
  AnimatedBlob,
  DotPattern,
  CrossPattern,
  DiagonalStripes,
} from "../components/shared/SvgDecorators";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { aboutSocialIcon } from "@/site/lib/aboutSocialIcons";
import { SECTION_PY } from "../../lib/pageLayout";
import { SectionEditor } from "../components/admin-edit/SectionEditor";
import { AboutContentEditor } from "../components/admin-edit/AboutContentEditor";
import { InlinePeopleEditor } from "../components/admin-edit/InlinePeopleEditor";
import { InlineLocationsEditor } from "../components/admin-edit/InlineLocationsEditor";
import type { AboutPeopleListKey, AboutPerson } from "@/lib/site-content/types";

const AboutLocationsMap = dynamic(
  () => import("../components/shared/AboutLocationsMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full min-h-[280px] rounded-2xl flex items-center justify-center text-sm"
        style={{ backgroundColor: "rgba(110,146,119,0.12)", color: "#6E9277" }}
      >
        Loading map…
      </div>
    ),
  }
);

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const GREEN = "#6E9277";
const GREEN_SOFT = "rgba(110,146,119,0.12)";
const GREEN_BORDER = "rgba(110,146,119,0.28)";

function PeopleCarousel({ people }: { people: AboutPerson[] }) {
  const c = useColors();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [people.length]);

  if (people.length === 0) {
    return (
      <p className="text-center text-sm py-10" style={{ color: c.muted }}>
        People will appear here once they are added.
      </p>
    );
  }

  const person = people[Math.min(index, people.length - 1)];
  const go = (dir: -1 | 1) => {
    setIndex((current) => (current + dir + people.length) % people.length);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative flex items-center gap-3 sm:gap-5">
        {people.length > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: GREEN }}
            aria-label="Previous person"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl overflow-hidden text-center mx-auto"
              style={{
                backgroundColor: c.white,
                boxShadow: "0 2px 24px rgba(110,146,119,0.12)",
                border: `1px solid ${GREEN_BORDER}`,
              }}
            >
              <div className="overflow-hidden h-72" style={{ backgroundColor: GREEN_SOFT }}>
                {person.img ? (
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl font-semibold"
                    style={{ color: GREEN }}
                  >
                    {person.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg mb-0.5" style={{ color: c.text }}>
                  {person.name}
                </h3>
                <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: GREEN }}>
                  {person.role}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: c.muted }}>
                  {person.bio}
                </p>
                {person.socialLinks?.length ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {person.socialLinks.map((link) => {
                      const Icon = aboutSocialIcon(link.platform);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-90"
                          style={{ backgroundColor: GREEN }}
                          aria-label={link.platform}
                        >
                          <Icon size={15} />
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {people.length > 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: GREEN }}
            aria-label="Next person"
          >
            <ChevronRight size={20} />
          </button>
        ) : (
          <div className="w-10 shrink-0" />
        )}
      </div>

      {people.length > 1 ? (
        <div className="flex justify-center gap-2 mt-5">
          {people.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === index ? 22 : 8,
                backgroundColor: i === index ? GREEN : GREEN_BORDER,
              }}
              aria-label={`Show ${p.name}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PeopleSection({
  list,
  eyebrow,
  title,
  intro,
  people,
  background,
  nextWave,
}: {
  list: AboutPeopleListKey;
  eyebrow: string;
  title: string;
  intro: string;
  people: AboutPerson[];
  background: string;
  nextWave: { top: string; bottom: string };
}) {
  const c = useColors();

  return (
    <InlinePeopleEditor list={list}>
      <section className="relative overflow-hidden" style={{ backgroundColor: background }}>
        <CrossPattern color="rgba(110,146,119,0.07)" />
        <AnimatedBlob color={GREEN} opacity={0.08} size={480} className="-top-24 -right-16" />

        <div className={`max-w-3xl mx-auto px-5 sm:px-8 ${SECTION_PY} relative z-10`}>
          <motion.div
            custom={0}
            variants={fadeSlide}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: GREEN }}>
              {eyebrow}
            </p>
            <h2 className="text-3xl lg:text-5xl mb-3" style={{ color: c.text }}>
              {title}
            </h2>
            <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: GREEN }} />
            <p className="text-sm max-w-xl mx-auto" style={{ color: c.muted }}>
              {intro}
            </p>
          </motion.div>

          <PeopleCarousel people={people} />
        </div>
        <WaveDivider topColor={nextWave.top} bottomColor={nextWave.bottom} />
      </section>
    </InlinePeopleEditor>
  );
}

export default function AboutPage() {
  const c = useColors();
  const { settings, about } = useSiteContent();
  const { websiteUseImages, aboutStoryImages } = useSiteMedia();
  const aboutBanner = useMediaUrl(websiteUseImages.about);

  const founders = [...about.founders].sort((a, b) => a.sortOrder - b.sortOrder);
  const leadership = [...about.leadership].sort((a, b) => a.sortOrder - b.sortOrder);
  const team = [...about.team].sort((a, b) => a.sortOrder - b.sortOrder);

  const storyImg0 = useMediaUrl(aboutStoryImages[0] || "");
  const storyImg1 = useMediaUrl(aboutStoryImages[1] || "");
  const storyImg2 = useMediaUrl(aboutStoryImages[2] || "");
  const storyImages = [storyImg0, storyImg1, storyImg2];

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
                ? "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(30,50,40,0.4), rgba(0,0,0,0.7))"
                : "linear-gradient(to bottom, rgba(110,146,119,0.35), transparent, rgba(0,0,0,0.5))",
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
        storyImages
        fields={[
          { key: "storyEyebrow", label: "Eyebrow" },
          { key: "storyTitle", label: "Title" },
          { key: "storyBody1", label: "First paragraph", multiline: true },
          { key: "storyBody2", label: "Second paragraph", multiline: true },
          { key: "storyQuote", label: "Quote", multiline: true },
        ]}
      >
        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <CrossPattern color="rgba(110,146,119,0.08)" />
          <AnimatedBlob color={GREEN} opacity={0.1} size={500} className="-top-20 right-0" />

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
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: GREEN }}>
                {about.storyEyebrow}
              </p>
              <h2 className="text-3xl lg:text-5xl mb-3 leading-tight" style={{ color: c.text }}>
                {about.storyTitle}
              </h2>
              <div className="w-16 h-1 rounded-full mb-6" style={{ backgroundColor: GREEN }} />
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
                    borderColor: GREEN,
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
                  borderColor: GREEN,
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
                  style={{ backgroundColor: GREEN }}
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
                  className={
                    i === 0
                      ? "col-span-2 overflow-hidden rounded-2xl ring-2 ring-[#6E9277]/25"
                      : "overflow-hidden rounded-2xl ring-1 ring-[#6E9277]/20"
                  }
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={img.src} alt="" className={img.className} />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <WaveDivider topColor={c.cream} bottomColor={GREEN_SOFT} />
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
        <section className="relative overflow-hidden" style={{ backgroundColor: GREEN_SOFT }}>
          <DiagonalStripes color="rgba(110,146,119,0.08)" />
          <AnimatedBlob color={GREEN} opacity={0.1} size={500} className="-bottom-40 -right-40" />

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
              style={{
                backgroundColor: c.white,
                border: `1px solid ${GREEN_BORDER}`,
                borderLeftWidth: 5,
                borderLeftColor: GREEN,
              }}
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: GREEN_SOFT }}
              >
                <Globe size={22} style={{ color: GREEN }} />
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
              style={{ backgroundColor: GREEN }}
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
          <WaveDivider topColor={GREEN_SOFT} bottomColor={c.cream} />
        </section>
      </AboutContentEditor>

      <PeopleSection
        list="founders"
        eyebrow={about.foundersEyebrow}
        title={about.foundersTitle}
        intro={about.foundersIntro}
        people={founders}
        background={c.cream}
        nextWave={{ top: c.cream, bottom: GREEN_SOFT }}
      />

      <PeopleSection
        list="leadership"
        eyebrow={about.leadershipEyebrow}
        title={about.leadershipTitle}
        intro={about.leadershipIntro}
        people={leadership}
        background={GREEN_SOFT}
        nextWave={{ top: GREEN_SOFT, bottom: c.white }}
      />

      <PeopleSection
        list="team"
        eyebrow={about.teamEyebrow}
        title={about.teamTitle}
        intro={about.teamIntro}
        people={team}
        background={c.white}
        nextWave={{ top: c.white, bottom: GREEN }}
      />

      {/* CTA before locations */}
      <section className="relative overflow-hidden" style={{ backgroundColor: GREEN }}>
        <AnimatedBlob color="#ffffff" opacity={0.06} size={400} className="-top-20 right-0" />
        <DotPattern color="rgba(255,255,255,0.1)" size={22} />
        <div className={`max-w-3xl mx-auto px-5 text-center ${SECTION_PY} relative z-10`}>
          <h2 className="text-3xl lg:text-4xl text-white mb-4">Pray with us. Partner with us.</h2>
          <p className="text-white/85 mb-8">Every gift and every prayer helps the work in Congo.</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-semibold"
              style={{ backgroundColor: "#EAC79A", color: "#474747" }}
            >
              Give here <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white border border-white/40"
            >
              Contact us
            </Link>
          </div>
        </div>
        <WaveDivider topColor={GREEN} bottomColor={GREEN_SOFT} />
      </section>

      {/* Locations */}
      <InlineLocationsEditor>
        <section className="relative overflow-hidden" style={{ backgroundColor: GREEN_SOFT }}>
          <CrossPattern color="rgba(110,146,119,0.1)" />
          <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY} relative z-10`}>
            <motion.div
              custom={0}
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: GREEN }}>
                {about.locationsEyebrow}
              </p>
              <h2 className="text-3xl lg:text-5xl mb-3" style={{ color: c.text }}>
                {about.locationsTitle}
              </h2>
              <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: GREEN }} />
              <p className="text-sm max-w-2xl mx-auto" style={{ color: c.muted }}>
                {about.locationsIntro}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
              <div className="space-y-4">
                {about.locations.map((loc, i) => (
                  <motion.div
                    key={loc.id}
                    custom={i}
                    variants={fadeSlide}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: c.white,
                      border: `1px solid ${GREEN_BORDER}`,
                      boxShadow: "0 2px 20px rgba(110,146,119,0.1)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: GREEN }}
                      >
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1" style={{ color: c.text }}>
                          {loc.label}
                        </h3>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: c.muted }}>
                          {loc.description}
                        </p>
                        <p className="text-xs font-medium" style={{ color: GREEN }}>
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div
                className="rounded-2xl overflow-hidden min-h-[300px]"
                style={{ border: `2px solid ${GREEN_BORDER}` }}
              >
                <AboutLocationsMap locations={about.locations} />
              </div>
            </div>
          </div>
          <WaveDivider topColor={GREEN_SOFT} bottomColor={c.footer} />
        </section>
      </InlineLocationsEditor>
    </div>
  );
}
