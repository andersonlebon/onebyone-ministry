"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { Play, Youtube } from "lucide-react";
import { featuredVideo, ministryVideos, websiteUseImages } from "@/content/media";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

const FEATURED = {
  id: featuredVideo.id,
  title: featuredVideo.title,
  desc: featuredVideo.desc,
  duration: featuredVideo.duration,
  category: featuredVideo.category,
  thumb: featuredVideo.thumb,
};

const VIDEOS = ministryVideos.map((v) => ({
  id: v.id,
  title: v.title,
  category: v.category,
  duration: v.duration,
  thumb: v.thumb,
}));

const CATEGORIES = ["All", "Education", "Community"];

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#6E9277",
  Entrepreneurship: "#EAC79A",
  Discipleship: "#5A4749",
  Community: "#6E9277",
  Documentary: "#474747",
  Report: "#7a7068",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function VideosPage() {
  const c = useColors();
  const [activeCategory, setActiveCategory] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = activeCategory === "All"
    ? VIDEOS
    : VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <div className="pt-20">
      <PageHero
        imageSrc={websiteUseImages.outreach}
        imageAlt="Ministry videos"
        eyebrow="Watch & Be Moved"
        title="Video Library"
        bottomColor={c.white}
      />

      {/* Featured Video */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "#6E9277" }}>Featured</p>
            <h2 className="text-2xl lg:text-3xl" style={{ color: c.text }}>Mission Documentary</h2>
          </motion.div>
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="relative rounded-xl overflow-hidden bg-[#474747] aspect-video group cursor-pointer"
                onClick={() => setPlayingId(FEATURED.id)}>
                {playingId === FEATURED.id ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${FEATURED.id}?autoplay=1`}
                    title={FEATURED.title}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={FEATURED.thumb}
                      alt={FEATURED.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play size={24} style={{ color: "#6E9277" }} className="ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {FEATURED.duration}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2"
            >
              <span className="text-xs px-2.5 py-1 rounded font-semibold text-white mb-3 inline-block" style={{ backgroundColor: "#474747" }}>
                {FEATURED.category}
              </span>
              <h3 className="text-xl mb-4" style={{ color: c.text }}>{FEATURED.title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: c.muted }}>{FEATURED.desc}</p>
              <div className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                <Youtube size={16} style={{ color: "#ff0000" }} />
                <span>Available on YouTube</span>
              </div>
            </motion.div>
          </div>
        </div>
        <WaveDivider topColor={c.white} bottomColor={c.cream} />
      </section>

      {/* Video Library */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "#6E9277" }}>All Videos</p>
            <h2 className="text-2xl lg:text-3xl" style={{ color: c.text }}>Browse the Collection</h2>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat ? "#6E9277" : c.white,
                  color: activeCategory === cat ? "#ffffff" : c.text,
                  border: activeCategory === cat ? "none" : `1px solid ${c.borderLight}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((video, i) => (
              <motion.div
                key={`${video.id}-${i}`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                className="group cursor-pointer"
                onClick={() => setPlayingId(`${video.id}-${i}`)}
              >
                <div className="relative rounded-xl overflow-hidden bg-[#474747] aspect-video mb-3">
                  {playingId === `${video.id}-${i}` ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                      title={video.title}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={video.thumb}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                        <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play size={18} style={{ color: "#6E9277" }} className="ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold text-white mb-1.5 inline-block"
                  style={{ backgroundColor: CATEGORY_COLORS[video.category] || "#6E9277" }}
                >
                  {video.category}
                </span>
                <h4 className="text-sm group-hover:text-[#6E9277] transition-colors" style={{ color: c.text }}>{video.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.white} />
      </section>

      {/* YouTube CTA */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <div className={`max-w-xl mx-auto px-5 sm:px-8 ${SECTION_PY} text-center`}>
          <Youtube size={32} className="mx-auto mb-4" style={{ color: "#ff0000" }} />
          <h3 className="text-xl mb-2" style={{ color: c.text }}>Subscribe on YouTube</h3>
          <p className="text-sm mb-5" style={{ color: c.muted }}>
            Never miss a story. Subscribe to our channel for regular updates from the field.
          </p>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: "#ff0000" }}
          >
            <Youtube size={16} /> Subscribe on YouTube
          </a>
        </div>
      </section>
    </div>
  );
}
