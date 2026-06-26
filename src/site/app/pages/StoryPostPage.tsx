"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowLeft, Calendar } from "lucide-react";

import type { Post } from "@/lib/site-content/types";
import { useColors } from "../../lib/themeStore";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function StoryPostPage({ post }: { post: Post }) {
  const c = useColors();
  const paragraphs = post.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={post.img}
        imageAlt={post.title}
        eyebrow={post.category}
        title={post.title}
        bottomColor={c.white}
        variant="cinematic"
      />

      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <div className={`max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 hover:opacity-80 transition-opacity"
            style={{ color: "#6E9277" }}
          >
            <ArrowLeft size={14} />
            Back to all stories
          </Link>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: c.muted }}>
              <span
                className="text-xs px-2.5 py-1 rounded font-semibold text-white"
                style={{ backgroundColor: "#6E9277" }}
              >
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} />
                {post.date}
              </span>
              <span>By {post.author}</span>
            </div>

            <p className="text-lg leading-relaxed" style={{ color: c.text }}>
              {post.excerpt}
            </p>

            <div className="space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm leading-8" style={{ color: c.muted }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
        <WaveDivider topColor={c.white} bottomColor={c.cream} />
      </section>
    </div>
  );
}
