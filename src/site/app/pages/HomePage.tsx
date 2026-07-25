"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useColors } from "../../lib/themeStore";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, type Variants } from "motion/react";
import {
  BookOpen, Heart, Users, ArrowRight, ChevronDown,
  Globe, Quote, Sparkles as SparklesIcon,
} from "lucide-react";
import { useSiteMedia, useMediaUrl } from "@/site/lib/mediaContext";
import { usePublishedPosts, useSiteContent } from "@/site/lib/siteContentContext";
import NewsletterSubscribeForm from "../components/shared/NewsletterSubscribeForm";
import FloatingParticles from "../components/shared/FloatingParticles";
import {
  WaveDivider, WaveBottom, DotPattern,
  AnimatedBlob, CrossPattern, DiagonalStripes, PulsingRing, Sparkles,
} from "../components/shared/SvgDecorators";
import { SectionEditor } from "../components/admin-edit/SectionEditor";
import { InlinePillarsEditor } from "../components/admin-edit/InlinePillarsEditor";
import { InlineProjectsEditor } from "../components/admin-edit/InlineProjectsEditor";
import { useCanInlineEdit } from "@/site/lib/adminEditContext";
import { pillarIcon } from "@/site/lib/pillarIcons";

/* ───── Animated Counter ───── */
function useAnimatedCounter(target: number, duration = 2400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            setCount(Math.floor(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

function parseStat(value: string): { n: number; suffix: string } {
  const match = value.trim().match(/^(\d+)(.*)$/);
  if (!match) return { n: 0, suffix: value };
  return { n: Number(match[1]), suffix: match[2] ?? "" };
}

/* ───── Word-by-word reveal ───── */
function WordReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 22, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.075, duration: 0.55, ease: "easeOut" }}
          className="inline-block mr-[0.26em]"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

/* ───── Section enter animation ───── */
const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: "easeOut" },
  }),
};

/* ───── Stat Card ───── */
function StatCard({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: any }) {
  const { count, ref } = useAnimatedCounter(value);
  const c = useColors();
  return (
    <motion.div
      ref={ref}
      variants={fadeSlide}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ scale: 1.04 }}
      className="relative flex flex-col items-center text-center px-5 py-7 sm:px-6 sm:py-8 rounded-2xl overflow-hidden"
      style={{ backgroundColor: c.white, border: "1px solid rgba(110,146,119,0.15)" }}
    >
      <PulsingRing color="#6E9277" size={48} className="absolute top-2 right-2 opacity-20 pointer-events-none" />
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: c.cream }}>
        <Icon size={20} style={{ color: "#6E9277" }} />
      </div>
      <p className="mb-1.5" style={{ fontSize: 52, lineHeight: 1, color: "#6E9277", fontFamily: "'Francois One', sans-serif" }}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: c.muted }}>{label}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const c = useColors();
  const canInlineEdit = useCanInlineEdit();
  const { brandAssets, homePillars, homePillarsHeading, websiteUseImages } = useSiteMedia();
  const heroBackground = useMediaUrl(websiteUseImages.hero);
  const { settings, projects } = useSiteContent();
  const publishedPosts = usePublishedPosts();

  const PROJECTS = projects
    .filter((project) => project.status !== "Archived")
    .slice(0, 3)
    .map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      desc: project.desc,
      img: project.img,
      status: project.status,
    }));

  const STORIES = publishedPosts.slice(0, 3).map((post) => ({
    id: post.id,
    slug: post.slug ?? post.id,
    title: post.title,
    date: post.date,
    category: post.category,
    img: post.img,
    excerpt: post.excerpt,
  }));

  const heroHeadline = settings.heroHeadline.replace(/\s*One By One\s*$/i, "").trim() || settings.heroHeadline;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const parallaxSmooth = useSpring(parallaxY, { stiffness: 80, damping: 20 });

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <SectionEditor
        title="Homepage hero"
        placement="hero"
        buttonLabel="Edit hero"
        fields={[
          {
            kind: "image",
            path: ["websiteUseImages", "hero"],
            label: "Background photo",
            help: "Large photo behind the homepage headline. Upload a clear, bright image.",
          },
          { kind: "text", key: "heroHeadline", label: "Headline", multiline: true },
          { kind: "text", key: "heroSubheadline", label: "Supporting line", multiline: true },
        ]}
      >
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0 overflow-hidden" style={{ y: parallaxSmooth }}>
          <div className="absolute inset-0" style={{ backgroundColor: c.isDark ? c.heroBg : c.cream }} />
          <img
            src={heroBackground}
            alt="One By One Ministries community"
            className="absolute left-0 w-full object-cover"
            style={{
              height: "calc(100% + 130px)",
              top: "-65px",
              opacity: c.isDark ? 0.18 : 0.45,
            }}
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>

        {/* Theme-aware overlay: white wash in light mode, softer dark veil in dark mode */}
        <div
          className="absolute inset-0"
          style={{
            background: c.isDark
              ? "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.68) 100%)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0.62) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: c.isDark
              ? "linear-gradient(to right, rgba(0,0,0,0.20) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)"
              : "linear-gradient(to right, rgba(255,255,255,0.26) 0%, transparent 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />

        {/* Particles */}
        <FloatingParticles count={32} />

        {/* Decorative elements */}
        <Sparkles count={10} color="#EAC79A" className="inset-0" />
        <AnimatedBlob color="#6E9277" opacity={0.08} size={500} className="-top-40 -right-40" />
        <AnimatedBlob color="#EAC79A" opacity={0.06} size={400} className="-bottom-20 -left-40" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center w-full py-28 sm:py-32 lg:py-36">
          <motion.div
            style={{ opacity: heroOpacity }}
            className="text-center px-5 max-w-5xl mx-auto flex flex-col items-center"
          >
          {/* Vertical brand mark — smaller here so the hero copy has room to breathe. */}
          <motion.img
            src={c.isDark ? brandAssets.logoVerticalWhite : brandAssets.logoVertical}
            alt="One By One Ministries"
            initial={{ opacity: 0, scale: 0.6, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7"
            style={{
              width: "clamp(92px, 12vw, 150px)",
              filter: c.isDark
                ? "drop-shadow(0 4px 32px rgba(0,0,0,0.7)) brightness(1.1)"
                : "drop-shadow(0 4px 20px rgba(71,71,71,0.15))",
            }}
          />


          {/* Main headline */}
          <h1
            className="mb-7 leading-tight max-w-4xl"
            style={{ fontSize: "clamp(2.25rem, 5.8vw, 4.75rem)", color: c.isDark ? "#ffffff" : c.text }}
          >
            <WordReveal text={heroHeadline} delay={0.7} />
            {settings.heroHeadline.toLowerCase().includes("one by one") && (
            <span className="block mt-2">
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.7, ease: "easeOut" }}
                style={{ color: "#EAC79A", display: "inline-block" }}
              >
                One By One
              </motion.span>
            </span>
            )}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
            className="text-lg sm:text-xl mb-12 max-w-3xl leading-relaxed"
            style={{ color: c.isDark ? "rgba(255,255,255,0.8)" : c.muted }}
          >
            {settings.heroSubheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-9 py-3.5 rounded-lg font-semibold text-base transition-colors"
                style={
                  c.isDark
                    ? { color: "#ffffff", border: "1px solid rgba(255,255,255,0.55)" }
                    : { color: c.text, border: "1px solid rgba(71,71,71,0.25)", backgroundColor: "rgba(255,255,255,0.6)" }
                }
              >
                Learn More
              </motion.button>
            </Link>
            <Link href="/donate">
              <motion.button
                whileHover={{ scale: 1.06, backgroundColor: "#5a7d64" }}
                whileTap={{ scale: 0.97 }}
                className="px-9 py-3.5 rounded-lg font-semibold text-white text-base"
                style={{ backgroundColor: "#6E9277" }}
              >
                Support the Mission
              </motion.button>
            </Link>
          </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: c.isDark ? "rgba(255,255,255,0.4)" : "rgba(71,71,71,0.45)" }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </motion.div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <WaveBottom fill={c.cream} />
        </div>
      </section>
      </SectionEditor>

      {/* ══════════ IMPACT STATS ══════════ */}
      <SectionEditor
        title="Homepage stats"
        fields={[
          { kind: "text", key: "statCommunities", label: "Villages number (e.g. 3)" },
          { kind: "text", key: "statCommunitiesLabel", label: "Villages label" },
          { kind: "text", key: "statFamilies", label: "Families number (e.g. 200+)" },
          { kind: "text", key: "statFamiliesLabel", label: "Families label" },
          { kind: "text", key: "statProjects", label: "Projects number (e.g. 4)" },
          { kind: "text", key: "statProjectsLabel", label: "Projects label" },
          { kind: "text", key: "statTeam", label: "Team number (e.g. 10)" },
          { kind: "text", key: "statTeamLabel", label: "Team label" },
        ]}
      >
      <section className="relative -mt-px" style={{ backgroundColor: c.cream }}>
        <DotPattern color="rgba(110,146,119,0.06)" size={24} />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {([
              { raw: settings.statCommunities || "3", label: settings.statCommunitiesLabel || "Villages Served", icon: Globe },
              { raw: settings.statFamilies || "200+", label: settings.statFamiliesLabel || "Families Reached", icon: Users },
              { raw: settings.statProjects || "4", label: settings.statProjectsLabel || "Projects", icon: BookOpen },
              { raw: settings.statTeam || "10", label: settings.statTeamLabel || "Team in Congo", icon: Heart },
            ] as const).map((stat) => {
              const parsed = parseStat(stat.raw);
              return (
                <StatCard
                  key={stat.label}
                  value={parsed.n}
                  suffix={parsed.suffix}
                  label={stat.label}
                  icon={stat.icon}
                />
              );
            })}
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>
      </SectionEditor>

      {/* ══════════ MISSION STATEMENT ══════════ */}
      <SectionEditor
        title="Mission statement"
        fields={[
          { kind: "text", key: "missionStatement", label: "Mission statement", multiline: true },
        ]}
      >
      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <CrossPattern color="rgba(110,146,119,0.05)" />
        <AnimatedBlob color="#6E9277" opacity={0.05} size={700} className="-top-60 -left-60" />
        <AnimatedBlob color="#EAC79A" opacity={0.08} size={500} className="-bottom-40 -right-40" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 lg:py-20 text-center relative z-10">
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-px flex-1 max-w-[80px] origin-right"
                style={{ backgroundColor: "#6E9277" }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Globe size={20} style={{ color: "#6E9277" }} />
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="h-px flex-1 max-w-[80px] origin-left"
                style={{ backgroundColor: "#6E9277" }}
              />
            </div>
            <motion.p
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-sm tracking-[0.22em] uppercase mb-6 font-semibold"
              style={{ color: "#6E9277" }}
            >
              Our Mission
            </motion.p>
            <motion.h2
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-3xl lg:text-5xl mb-8 leading-tight"
              style={{ color: c.text }}
            >
              Changing the World One Person at a Time
            </motion.h2>
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl lg:text-2xl leading-relaxed mb-6 px-4"
              style={{ color: c.text, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {settings.missionStatement || "Your mission statement will appear here."}
            </motion.blockquote>
          </motion.div>
        </div>
        <WaveDivider topColor={c.white} bottomColor={c.cream} />
      </section>
      </SectionEditor>

      {/* ══════════ CORE PILLARS ══════════ */}
      <InlinePillarsEditor>
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DiagonalStripes color="rgba(110,146,119,0.06)" />
        <AnimatedBlob color="#5A4749" opacity={0.05} size={600} className="top-0 right-0" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
              {homePillarsHeading.eyebrow}
            </p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>
              {homePillarsHeading.title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {homePillars.map((pillar, i) => {
              const Icon = pillarIcon(pillar.icon);
              return (
                <motion.div
                  key={pillar.key}
                  custom={i}
                  variants={fadeSlide}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  whileHover={{ y: -10, boxShadow: "0 24px 60px rgba(71,71,71,0.12)" }}
                  transition={{ duration: 0.3 }}
                  className="group rounded-2xl overflow-hidden"
                  style={{ backgroundColor: c.white, border: "1px solid rgba(110,146,119,0.15)" }}
                >
                  <div className="relative h-48 overflow-hidden" style={{ backgroundColor: pillar.color + "22" }}>
                    <motion.img
                      src={pillar.img}
                      alt={pillar.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <motion.div
                      className="absolute bottom-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: pillar.color }}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Icon size={18} color="#ffffff" />
                    </motion.div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base mb-2" style={{ color: c.text }}>{pillar.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{pillar.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>
      </InlinePillarsEditor>

      {/* ══════════ FEATURED PROJECTS ══════════ */}
      {PROJECTS.length > 0 || canInlineEdit ? (
      <InlineProjectsEditor title="Featured projects">
      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <AnimatedBlob color="#6E9277" opacity={0.05} size={500} className="top-20 -left-40" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase mb-2" style={{ color: "#6E9277" }}>On the Ground</p>
              <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Featured Projects</h2>
            </div>
            <Link href="/projects" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#6E9277" }}>
              View All <ArrowRight size={14} />
            </Link>
          </motion.div>

          {PROJECTS.length === 0 ? (
            <p className="text-center text-sm py-10" style={{ color: c.muted }}>
              No projects yet. Click Edit projects to add one and upload a photo from your computer.
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {PROJECTS.map((project, i) => (
              <motion.div
                key={project.id}
                custom={i}
                variants={fadeSlide}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -12 }}
                transition={{ duration: 0.25 }}
                className="group rounded-2xl overflow-hidden"
                style={{ backgroundColor: c.white, boxShadow: "0 2px 20px rgba(71,71,71,0.07)", border: "1px solid rgba(110,146,119,0.12)" }}
              >
                <div className="relative h-56 overflow-hidden" style={{ backgroundColor: c.borderLight }}>
                  <motion.img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.07 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <motion.span
                    className="absolute top-4 left-4 text-white text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: "#6E9277" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {project.category}
                  </motion.span>
                  <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-white/90 text-[#6E9277] font-semibold">
                    {project.status}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-base mb-2 leading-snug" style={{ color: c.text }}>{project.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: c.muted }}>{project.desc}</p>
                  <Link href="/projects" className="flex items-center gap-1.5 text-sm font-semibold group/link" style={{ color: "#6E9277" }}>
                    <motion.span whileHover={{ x: 3 }} className="flex items-center gap-1.5">
                      Read More <ArrowRight size={13} />
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
        <WaveDivider topColor={c.white} bottomColor="#6E9277" />
      </section>
      </InlineProjectsEditor>
      ) : (
        <WaveDivider topColor={c.cream} bottomColor="#6E9277" />
      )}

      {/* ══════════ VERSE BREAK ══════════ */}
      <SectionEditor
        title="Homepage verse"
        fields={[
          { kind: "text", key: "verseText", label: "Verse text", multiline: true },
          { kind: "text", key: "verseReference", label: "Reference (e.g. Ephesians 3:19–20)" },
        ]}
      >
      <section className="relative overflow-hidden" style={{ backgroundColor: "#6E9277" }}>
        <DotPattern color="rgba(255,255,255,0.12)" size={22} />
        <AnimatedBlob color="#ffffff" opacity={0.08} size={500} className="-top-20 right-0" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 lg:py-20 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Quote size={36} className="mx-auto mb-6 opacity-40 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl lg:text-4xl text-white/95 leading-relaxed mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            “{settings.verseText || "…that you may be filled with all the fullness of God. Now to him who is able to do far more abundantly than all that we ask or think…"}”
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-sm tracking-widest"
          >
            — {settings.verseReference || "Ephesians 3:19–20"}
          </motion.p>
        </div>
        <WaveDivider topColor="#6E9277" bottomColor={c.cream} />
      </section>
      </SectionEditor>

      {/* ══════════ STORIES ══════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <CrossPattern color="rgba(110,146,119,0.05)" />
        <AnimatedBlob color="#6E9277" opacity={0.05} size={450} className="top-0 right-0" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase mb-2" style={{ color: "#6E9277" }}>From the Field</p>
              <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Stories & Updates</h2>
            </div>
            <Link href="/stories" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#6E9277" }}>
              All Stories <ArrowRight size={14} />
            </Link>
          </motion.div>

          {STORIES.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {STORIES.map((story, i) => (
                <motion.article
                  key={story.id}
                  custom={i}
                  variants={fadeSlide}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="group"
                >
                  <Link href={`/stories/${story.slug}`}>
                    <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: c.borderLight, boxShadow: "0 2px 20px rgba(71,71,71,0.07)" }}>
                      <motion.img
                        src={story.img}
                        alt={story.title}
                        className="w-full h-52 object-cover"
                        whileHover={{ scale: 1.07 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#6E9277" + "20", color: "#6E9277" }}>
                        {story.category}
                      </span>
                      <span className="text-xs" style={{ color: c.muted }}>{story.date}</span>
                    </div>
                    <motion.h3
                      className="text-base mb-2 leading-snug group-hover:text-[#6E9277] transition-colors"
                      style={{ color: c.text }}
                    >
                      {story.title}
                    </motion.h3>
                    <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{story.excerpt}</p>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              variants={fadeSlide}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="rounded-2xl px-6 py-12 text-center"
              style={{ backgroundColor: c.white, border: `1px solid ${c.borderLight}` }}
            >
              <p className="text-base mb-2" style={{ color: c.text }}>
                New stories from the field will appear here.
              </p>
              <p className="text-sm mb-5" style={{ color: c.muted }}>
                Check back soon, or browse the full Stories page.
              </p>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#6E9277" }}
              >
                Visit Stories <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
        </div>
        <WaveDivider topColor={c.cream} bottomColor="#6E9277" />
      </section>

      {/* ══════════ DONATE CTA ══════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#6E9277" }}>
        <DotPattern color="rgba(255,255,255,0.1)" size={24} />
        <AnimatedBlob color="#ffffff" opacity={0.06} size={600} className="-top-40 -left-40" />
        <AnimatedBlob color="#EAC79A" opacity={0.1} size={400} className="-bottom-20 right-0" />
        <Sparkles count={14} color="rgba(255,255,255,0.6)" className="inset-0" />
        <PulsingRing color="#ffffff" size={200} className="-top-20 -right-20 opacity-10" />

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 lg:py-20 text-center relative z-10">
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ border: "2px solid rgba(234,199,154,0.5)" }}
            >
              <SparklesIcon size={20} className="text-[#EAC79A]" />
            </motion.div>
            <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-4">Partner With Us</p>
            <h2 className="text-4xl lg:text-6xl text-white mb-5 leading-tight">
              Give Here
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Every dollar helps. Every gift goes to the field in Congo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <motion.button
                  whileHover={{ scale: 1.07, backgroundColor: "#d4a870" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-base"
                  style={{ backgroundColor: "#EAC79A", color: c.text }}
                >
                  <Heart size={17} /> Donate
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-xl font-semibold text-base text-white border border-white/40"
                >
                  Learn About Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
        <WaveDivider topColor="#6E9277" bottomColor="#474747" />
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#474747" }}>
        <DotPattern color="rgba(255,255,255,0.04)" size={20} />
        <div className="max-w-xl mx-auto px-5 sm:px-8 py-14 lg:py-20 text-center relative z-10">
          <motion.div variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-xs tracking-[0.2em] uppercase mb-2 text-[#EAC79A]">Stay Connected</p>
            <h3 className="text-2xl text-white mb-2">Join Our Prayer Network</h3>
            <p className="text-sm text-white/55 mb-6">Receive monthly updates, field stories, and prayer requests.</p>
            <NewsletterSubscribeForm
              layout="inline"
              className="flex flex-col sm:flex-row gap-3 justify-center"
              inputClassName="flex-1 px-4 py-3 rounded-lg text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277] bg-white"
              buttonClassName="px-6 py-3 rounded-lg font-semibold text-sm text-white bg-[#6E9277] hover:bg-[#5a7d64]"
            />
          </motion.div>
        </div>
      </section>
      <WaveDivider topColor="#474747" bottomColor={ c.footer } />
    </div>
  );
}
