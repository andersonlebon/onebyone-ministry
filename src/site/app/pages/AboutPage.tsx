"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { useColors } from "../../lib/themeStore";
import { Heart, Globe, BookOpen, Users, Lightbulb, ArrowRight } from "lucide-react";
import { WaveDivider, AnimatedBlob, DotPattern, CrossPattern, DiagonalStripes, Sparkles } from "../components/shared/SvgDecorators";
import FoundersTree from "../components/shared/FoundersTree";

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

const VALUES = [
  { icon: Heart, title: "Compassion", desc: "Every person bears the image of God and deserves dignity, care, and the opportunity to flourish." },
  { icon: BookOpen, title: "Truth", desc: "We build on the unshakeable foundation of Scripture and the transformative power of the Gospel." },
  { icon: Users, title: "Community", desc: "Lasting change happens within relationships — we walk alongside communities, not ahead of them." },
  { icon: Globe, title: "Stewardship", desc: "Every dollar given is a sacred trust. We operate with full financial transparency and accountability." },
  { icon: Lightbulb, title: "Empowerment", desc: "We equip, not enable — building local capacity so communities own and sustain their own transformation." },
];

const LEADERS = [
  { name: "Rev. Emmanuel Tshilobo", role: "Executive Director & Co-Founder", bio: "Born in the DRC, Emmanuel has served in ministry for 20+ years. He holds a Master of Divinity and has a heart for reconciling the church with its community calling.", img: "https://images.unsplash.com/photo-1547496613-4e19af6736dc?w=400&h=400&fit=crop&auto=format" },
  { name: "Grace Tshilobo", role: "Director of Programs & Co-Founder", bio: "Originally from Atlanta, Grace brings expertise in women's development, entrepreneurship education, and cross-cultural program design.", img: "https://images.unsplash.com/photo-1632215861513-130b66fe97f4?w=400&h=400&fit=crop&auto=format" },
  { name: "Jonathan Kalala", role: "Community Development Lead", bio: "A native of Kasai Province, Jonathan builds relationships with village chiefs and local NGOs to ensure every project is community-owned.", img: "https://images.unsplash.com/photo-1571417800906-5a5058dbd45d?w=400&h=400&fit=crop&auto=format" },
];

export default function AboutPage() {
  const c = useColors();
  return (
    <div className="overflow-x-hidden pt-20">

      {/* Page Hero */}
      <section className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden bg-[#1a2a1f]">
        <motion.img
          src="https://images.unsplash.com/photo-1717572316112-3e3839554744?w=1400&h=600&fit=crop&auto=format"
          alt="Community gathering"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.38 }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <Sparkles count={10} color="#EAC79A" className="inset-0" />
        <AnimatedBlob color="#6E9277" opacity={0.08} size={400} className="-top-20 right-0" />

        <div className="relative z-10 text-center px-5">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#EAC79A] text-xs tracking-[0.2em] uppercase mb-3"
          >
            Who We Are
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-4xl lg:text-6xl text-white"
          >
            About One By One Ministries
          </motion.h1>
        </div>
        <WaveDivider topColor="transparent" bottomColor={c.cream} />
      </section>

      {/* Our Story */}
      <section className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: c.cream }}>
        <CrossPattern color="rgba(110,146,119,0.06)" />
        <AnimatedBlob color="#EAC79A" opacity={0.07} size={500} className="-top-20 right-0" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center relative z-10">
          <motion.div custom={0} variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>How It Began</p>
            <h2 className="text-3xl lg:text-5xl mb-6 leading-tight" style={{ color: c.text }}>A Vision Born in the Heart of Congo</h2>
            <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
              One By One Ministries began with a single trip to the Democratic Republic of Congo. What our founders witnessed — children without schools, families without economic hope, rural villages with little Gospel access — compelled them to act.
            </p>
            <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
              The name says it all. We believe transformation doesn't happen in sweeping programs. It happens one person at a time, one family at a time — through patient, faithful work of love, discipleship, and service.
            </p>
            <p
              className="text-lg text-[#5A4749] leading-relaxed mb-7 border-l-4 pl-4"
              style={{ borderColor: "#EAC79A", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              "We believe the DRC is ready for a generation-defining revival — and we are privileged to be part of it."
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
              { src: "https://images.unsplash.com/photo-1627423896085-e3e694d88e40?w=600&h=400&fit=crop&auto=format", className: "col-span-2 h-52 rounded-2xl object-cover w-full" },
              { src: "https://images.unsplash.com/photo-1689844759889-f8d92bd8a03a?w=350&h=300&fit=crop&auto=format", className: "h-40 rounded-2xl object-cover w-full" },
              { src: "https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?w=350&h=300&fit=crop&auto=format", className: "h-40 rounded-2xl object-cover w-full" },
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

      {/* Vision & Mission */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: c.white }}>
        <DiagonalStripes color="rgba(110,146,119,0.04)" />
        <AnimatedBlob color="#5A4749" opacity={0.04} size={500} className="-bottom-40 -right-40" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-8 relative z-10">
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
            <motion.div whileHover={{ rotate: 15 }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: c.cream }}>
              <Globe size={22} style={{ color: "#6E9277" }} />
            </motion.div>
            <h3 className="text-2xl mb-4" style={{ color: c.text }}>Our Vision</h3>
            <p className="text-lg text-[#5A4749] leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
              A world where every person — regardless of geography, poverty, or circumstance — has access to the transformative love of Jesus Christ, quality education, and the opportunity to build a dignified, flourishing life.
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
            <motion.div whileHover={{ rotate: 15 }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-white/20">
              <Heart size={22} className="text-white" />
            </motion.div>
            <h3 className="text-2xl text-white mb-4">Our Mission</h3>
            <p className="text-lg text-white/90 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
              One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship — changing the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════ FOUNDERS TREE ══════ */}
      <FoundersTree />

      {/* Core Values */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DotPattern color="rgba(110,146,119,0.08)" size={22} />
        <AnimatedBlob color="#6E9277" opacity={0.06} size={600} className="-top-40 left-0" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <motion.div custom={0} variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>What Drives Us</p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Our Core Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {VALUES.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
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
                  <h4 className="text-sm mb-2" style={{ color: c.text }}>{val.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>

      {/* Leadership */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: c.white }}>
        <CrossPattern color="rgba(110,146,119,0.04)" />
        <AnimatedBlob color="#EAC79A" opacity={0.06} size={500} className="-top-20 -right-20" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <motion.div custom={0} variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>The Team</p>
            <h2 className="text-3xl lg:text-5xl" style={{ color: c.text }}>Leadership</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERS.map((leader, i) => (
              <motion.div
                key={leader.name}
                custom={i}
                variants={fadeSlide}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: c.white, boxShadow: "0 2px 24px rgba(71,71,71,0.07)", border: "1px solid rgba(110,146,119,0.12)" }}
              >
                <div className="overflow-hidden h-64">
                  <motion.img
                    src={leader.img}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-base mb-0.5" style={{ color: c.text }}>{leader.name}</h3>
                  <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: "#6E9277" }}>{leader.role}</p>
                  <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{leader.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Congo */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: c.cream }}>
        <DiagonalStripes color="rgba(110,146,119,0.05)" />
        <AnimatedBlob color="#6E9277" opacity={0.07} size={500} className="-bottom-20 right-0" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div custom={0} variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <motion.img
                src="https://images.unsplash.com/photo-1658129850537-ea7517a9682f?w=800&h=600&fit=crop&auto=format"
                alt="Children in the DRC"
                className="w-full h-80 object-cover"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
          <motion.div custom={1} variants={fadeSlide} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>Why Congo</p>
            <h2 className="text-3xl lg:text-4xl mb-6 leading-tight" style={{ color: c.text }}>The DRC: Immense Need, Immense Promise</h2>
            <p className="leading-relaxed mb-4" style={{ color: c.muted }}>
              The Democratic Republic of Congo is among the world's most impoverished nations, yet it is rich in natural resources and extraordinary people — resilient, joyful, faith-filled communities hungry for opportunity and for Christ.
            </p>
            <p className="leading-relaxed mb-6" style={{ color: c.muted }}>
              We believe the DRC is on the threshold of a generation-defining transformation, and we are called to be part of it — not through charity, but through partnership that restores dignity and builds lasting foundations.
            </p>
            <div className="flex gap-4">
              <Link href="/projects">
                <motion.button whileHover={{ scale: 1.04, backgroundColor: "#5a7d64" }} whileTap={{ scale: 0.97 }} className="px-6 py-3 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#6E9277" }}>
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
      </section>
    </div>
  );
}
