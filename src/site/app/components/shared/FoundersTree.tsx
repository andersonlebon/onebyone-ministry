"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { Heart, Leaf } from "lucide-react";
import { useColors } from "../../../lib/themeStore";
import { useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { aboutIcon } from "@/site/lib/aboutIcons";
import { SECTION_PY } from "../../../lib/pageLayout";
import { WaveDivider } from "./SvgDecorators";
import { InlineTimelineEditor } from "../admin-edit/InlineTimelineEditor";
import type { AboutTimelineMilestone } from "@/lib/site-content/types";

type DisplayMilestone = AboutTimelineMilestone & { resolvedImg: string };

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

function TreeNode({ milestone, index }: { milestone: DisplayMilestone; index: number }) {
  const c = useColors();
  const Icon = aboutIcon(milestone.icon);
  const isLeft = milestone.side === "left";

  return (
    <div className={`relative flex items-start gap-0 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <motion.div
        variants={fadeSlide}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: index * 0.08 }}
        className={`w-[calc(50%-32px)] ${isLeft ? "mr-auto pr-6 text-right" : "ml-auto pl-6 text-left"}`}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
          style={{ backgroundColor: c.white, border: `1px solid ${c.border}` }}
        >
          <div className="relative h-32 overflow-hidden" style={{ backgroundColor: c.borderLight }}>
            {milestone.resolvedImg ? (
              <motion.img
                src={milestone.resolvedImg}
                alt={milestone.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.5 }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className={`p-5 ${isLeft ? "text-right" : "text-left"}`}>
            <p className="text-xs font-bold tracking-[0.2em] mb-1" style={{ color: milestone.color }}>
              {milestone.year}
            </p>
            <h4 className="text-sm mb-2 leading-snug" style={{ color: c.text }}>
              {milestone.title}
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
              {milestone.desc}
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: milestone.color, border: `4px solid ${c.white}` }}
        >
          <Icon size={20} color="white" />
        </motion.div>
      </div>
    </div>
  );
}

export default function FoundersTree() {
  const c = useColors();
  const { about } = useSiteContent();
  const { founderTimelineImages } = useSiteMedia();
  const milestones: DisplayMilestone[] = about.timeline.map((m, i) => ({
    ...m,
    resolvedImg: m.img || founderTimelineImages[i] || "",
  }));
  const roots = about.roots;
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const trunkHeight = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <InlineTimelineEditor>
      <section
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ backgroundColor: "rgba(110,146,119,0.1)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0"
            style={{ width: 1, height: "100%", overflow: "hidden" }}
          >
            <motion.div
              style={{ height: trunkHeight, backgroundColor: "#6E9277", opacity: 0.2, width: 1 }}
            />
          </motion.div>
        </div>

        <div className={`max-w-6xl mx-auto px-5 lg:px-8 relative ${SECTION_PY}`}>
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#6E9277" }}>
              {about.timelineEyebrow}
            </p>
            <h2 className="text-3xl lg:text-5xl mb-4" style={{ color: c.text }}>
              {about.timelineTitle}
            </h2>
            <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: c.muted }}>
              {about.timelineIntro}
            </p>
          </motion.div>

          <div className="relative flex justify-center gap-0 mb-16">
            <div className="flex w-full max-w-2xl mx-auto">
              {roots.map((root) => (
                <motion.div
                  key={root.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="flex-1 text-center px-4"
                >
                  <div
                    className="rounded-2xl p-5 inline-block w-full"
                    style={{ backgroundColor: root.color + "18", border: `2px solid ${root.color}30` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: root.color }}
                    >
                      <Heart size={18} color="white" />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: c.text }}>
                      {root.label}
                    </p>
                    <p className="text-xs mt-1" style={{ color: c.muted }}>
                      {root.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <svg width="400" height="60" viewBox="0 0 400 60">
              <motion.path
                d="M 80 0 Q 80 30 200 60 Q 320 30 320 0"
                stroke="#6E9277"
                strokeWidth="2"
                fill="none"
                strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ backgroundColor: "#6E9277", color: "white" }}
            >
              <Leaf size={13} /> Their Shared Journey
            </motion.div>
          </div>

          <div className="relative space-y-10">
            <div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5"
              style={{ backgroundColor: "rgba(110,146,119,0.18)" }}
            />

            {milestones.map((milestone, i) => (
              <TreeNode key={milestone.id} milestone={milestone} index={i} />
            ))}
          </div>

          <div className="relative flex justify-center mt-16">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg width="200" height="80" viewBox="0 0 200 80">
                  <motion.path
                    d="M 100 80 L 100 40 M 100 60 L 60 20 M 100 50 L 140 20 M 100 40 L 80 5 M 100 40 L 120 5"
                    stroke="#6E9277"
                    strokeWidth="2"
                    fill="none"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                  />
                  {[
                    { cx: 60, cy: 18 },
                    { cx: 140, cy: 18 },
                    { cx: 80, cy: 3 },
                    { cx: 120, cy: 3 },
                    { cx: 100, cy: 0 },
                  ].map((pos, i) => (
                    <motion.circle
                      key={i}
                      cx={pos.cx}
                      cy={pos.cy}
                      r="7"
                      fill="#6E9277"
                      fillOpacity={0.7}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 + i * 0.12, duration: 0.5 }}
                    />
                  ))}
                </svg>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-7 inline-block max-w-sm"
                style={{ backgroundColor: "#6E9277", color: "white" }}
              >
                <p className="text-xs tracking-widest uppercase mb-2 text-white/60">
                  {about.timelineFruitLabel}
                </p>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "'Francois One', sans-serif" }}
                >
                  {about.timelineFruitTitle}
                </p>
                <p className="text-sm text-white/80">{about.timelineFruitSub}</p>
              </motion.div>
            </div>
          </div>
        </div>
        <WaveDivider topColor="rgba(110,146,119,0.1)" bottomColor={c.footer} />
      </section>
    </InlineTimelineEditor>
  );
}
