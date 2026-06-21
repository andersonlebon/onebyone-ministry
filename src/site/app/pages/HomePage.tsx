"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useColors } from "../../lib/themeStore";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, type Variants } from "motion/react";
import {
  BookOpen, Lightbulb, Heart, Users, ArrowRight, ChevronDown,
  Globe, Quote, Sparkles as SparklesIcon,
} from "lucide-react";
import { brandAssets, homePillars, homeProjects, homeStories, websiteUseImages } from "@/content/media";
import FloatingParticles from "../components/shared/FloatingParticles";
import {
  WaveDivider, WaveBottom, DotPattern,
  AnimatedBlob, CrossPattern, DiagonalStripes, PulsingRing, Sparkles, OrnamentalRule,
} from "../components/shared/SvgDecorators";

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

/* ───── Data ───── */
const PILLARS = [
  { icon: BookOpen, title: "Education", color: "#6E9277", img: homePillars[0].img, desc: "Building schools, training teachers, and equipping every child with the tools they need to flourish." },
  { icon: Lightbulb, title: "Entrepreneurship", color: "#EAC79A", img: homePillars[1].img, desc: "Equipping families with skills, micro-grants, and mentorship to build sustainable livelihoods." },
  { icon: Heart, title: "Spiritual Discipleship", color: "#5A4749", img: homePillars[2].img, desc: "Sharing the Gospel through Bible study, pastoral training, and church partnerships in unreached villages." },
  { icon: Users, title: "Community Development", color: "#6E9277", img: homePillars[3].img, desc: "Building infrastructure, clean water access, and healthcare systems that lift entire communities." },
];

const PROJECTS = [
  { id: 1, title: "Rural School Building Initiative", category: "Education", desc: "Constructing classrooms in remote villages to give 200+ children a safe place to learn.", img: homeProjects[0], status: "Active" },
  { id: 2, title: "Women's Entrepreneurship Cohort", category: "Entrepreneurship", desc: "12-week program empowering 30 women with business training and start-up capital.", img: homeProjects[1], status: "Active" },
  { id: 3, title: "Village Pastoral Training", category: "Discipleship", desc: "Equipping 15 rural pastors per cohort with theological education and ongoing mentorship.", img: homeProjects[2], status: "Active" },
];

const STORIES = [
  { id: 1, title: "How One School Changed a Whole Village", date: "May 28, 2025", category: "Education", img: homeStories[0], excerpt: "When Amara received her first textbook at 11, she said it was the most beautiful thing she'd ever seen. Today she teaches the next generation." },
  { id: 2, title: "From Despair to Purpose: Jean-Paul's Story", date: "April 14, 2025", category: "Discipleship", img: homeStories[1], excerpt: "One discipleship meeting sparked a revival now reaching five surrounding villages every Sunday morning." },
  { id: 3, title: "Mamas Building a Future", date: "March 3, 2025", category: "Entrepreneurship", img: homeStories[2], excerpt: "28 women graduated from the Entrepreneurship Cohort, now running businesses that feed their families." },
];

/* ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const c = useColors();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const parallaxSmooth = useSpring(parallaxY, { stiffness: 80, damping: 20 });

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0 overflow-hidden" style={{ y: parallaxSmooth }}>
          <div className="absolute inset-0" style={{ backgroundColor: c.isDark ? c.heroBg : c.cream }} />
          <img
            src={websiteUseImages.hero}
            alt="One By One Ministries community"
            className="absolute left-0 w-full object-cover"
            style={{
              height: "calc(100% + 130px)",
              top: "-65px",
              opacity: c.isDark ? 0.22 : 0.52,
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
              ? "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.58) 100%)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.48) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: c.isDark
              ? "linear-gradient(to right, rgba(0,0,0,0.14) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)"
              : "linear-gradient(to right, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
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

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xs tracking-[0.22em] uppercase mb-6"
            style={{ color: c.isDark ? "#EAC79A" : "#6E9277" }}
          >
            Rebuilding Lives · Democratic Republic of Congo
          </motion.p>

          {/* Main headline */}
          <h1
            className="mb-7 leading-tight max-w-4xl"
            style={{ fontSize: "clamp(2.25rem, 5.8vw, 4.75rem)", color: c.isDark ? "#ffffff" : c.text }}
          >
            <WordReveal text="Bringing Hope, Education, and the Love of Christ" delay={0.7} />
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
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
            className="text-lg sm:text-xl mb-12 max-w-3xl leading-relaxed"
            style={{ color: c.isDark ? "rgba(255,255,255,0.8)" : c.muted }}
          >
            Transforming communities through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.
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

      {/* ══════════ IMPACT STATS ══════════ */}
      <section className="relative -mt-px" style={{ backgroundColor: c.cream }}>
        <DotPattern color="rgba(110,146,119,0.06)" size={24} />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard value={18} suffix="+" label="Communities Served" icon={Globe} />
            <StatCard value={500} suffix="+" label="Families Reached" icon={Users} />
            <StatCard value={8} suffix="" label="Education Projects" icon={BookOpen} />
            <StatCard value={65} suffix="+" label="Volunteers" icon={Heart} />
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>

      {/* ══════════ MISSION STATEMENT ══════════ */}
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
              className="text-xs tracking-[0.22em] uppercase mb-5"
              style={{ color: "#6E9277" }}
            >
              Our Mission
            </motion.p>
            <OrnamentalRule color="#6E9277" />
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
              className="text-xl lg:text-2xl text-[#5A4749] leading-relaxed mb-6 px-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              "One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship. We seek to change the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God."
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-base"
              style={{ color: c.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              — Matthew 28:19 · "Go and make disciples of all nations"
            </motion.p>
          </motion.div>
        </div>
        <WaveDivider topColor={c.white} bottomColor={c.cream} />
      </section>

      {/* ══════════ CORE PILLARS ══════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DiagonalStripes color="rgba(110,146,119,0.06)" />
        <AnimatedBlob color="#5A4749" opacity={0.05} size={600} className="top-0 right-0" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>How We Serve</p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Four Pillars of Transformation</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  custom={i}
                  variants={fadeSlide}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  whileHover={{ y: -10, boxShadow: "0 24px 60px rgba(71,71,71,0.12)" }}
                  transition={{ duration: 0.3 }}
                  className="group rounded-2xl overflow-hidden cursor-pointer"
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

      {/* ══════════ FEATURED PROJECTS ══════════ */}
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
        </div>
        <WaveDivider topColor={c.white} bottomColor="#5A4749" />
      </section>

      {/* ══════════ VERSE BREAK ══════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#5A4749" }}>
        <DotPattern color="rgba(234,199,154,0.12)" size={22} />
        <AnimatedBlob color="#EAC79A" opacity={0.08} size={500} className="-top-20 right-0" />
        <AnimatedBlob color="#6E9277" opacity={0.1} size={400} className="-bottom-10 left-10" />
        <Sparkles count={12} color="#EAC79A" className="inset-0" />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 lg:py-20 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Quote size={36} className="mx-auto mb-6 opacity-40 text-[#EAC79A]" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl lg:text-4xl text-white/90 leading-relaxed mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            "He who began a good work in you will carry it on to completion until the day of Christ Jesus."
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-[#EAC79A] text-sm tracking-widest"
          >
            — Philippians 1:6
          </motion.p>
        </div>
        <WaveDivider topColor="#5A4749" bottomColor={c.cream} />
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {STORIES.map((story, i) => (
              <motion.article
                key={story.id}
                custom={i}
                variants={fadeSlide}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="group cursor-pointer"
              >
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
                  className="text-base mb-2 leading-snug"
                  style={{ color: c.text }}
                  whileHover={{ color: "#6E9277" }}
                  transition={{ duration: 0.2 }}
                >
                  {story.title}
                </motion.h3>
                <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{story.excerpt}</p>
              </motion.article>
            ))}
          </div>
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
            <p className="text-white/70 text-xs tracking-[0.2em] uppercase mb-4">Every Gift Matters</p>
            <h2 className="text-4xl lg:text-6xl text-white mb-5 leading-tight">
              Your Gift Changes Lives in Congo
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              $25 feeds a family · $50 puts a child in school · $100 funds a month of village ministry
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <motion.button
                  whileHover={{ scale: 1.07, backgroundColor: "#d4a870" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-base"
                  style={{ backgroundColor: "#EAC79A", color: c.text }}
                >
                  <Heart size={17} /> Give Now
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
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:ring-2 ring-[#6E9277] bg-white"
              />
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: "#5a7d64" }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-6 py-3 rounded-lg font-semibold text-sm text-white"
                style={{ backgroundColor: "#6E9277" }}
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
      <WaveDivider topColor="#474747" bottomColor={ c.footer } />
    </div>
  );
}
