"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { Youtube } from "lucide-react";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import { parseYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { InlineVideosEditor } from "../components/admin-edit/InlineVideosEditor";
import { SECTION_PY } from "../../lib/pageLayout";

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

function YoutubeEmbed({
  id,
  title,
  className = "",
}: {
  id: string;
  title: string;
  className?: string;
}) {
  if (!id) {
    return (
      <div
        className={`flex items-center justify-center bg-[#474747] text-white/70 text-sm ${className}`}
      >
        Invalid YouTube video
      </div>
    );
  }

  return (
    <iframe
      className={className}
      src={youtubeEmbedUrl(id)}
      title={title || "YouTube video"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

export default function VideosPage() {
  const c = useColors();
  const { featuredVideo, websiteUseImages } = useSiteMedia();
  const bannerSrc = useMediaUrl(websiteUseImages.outreach);
  const { videos: contentVideos, settings } = useSiteContent();

  const VIDEOS = contentVideos
    .map((v) => ({
      id: parseYoutubeId(v.youtubeId),
      title: v.title,
      category: v.category,
      duration: v.duration,
    }))
    .filter((v) => v.id);

  const FEATURED = VIDEOS[0]
    ? { ...VIDEOS[0], desc: "" }
    : {
        id: parseYoutubeId(featuredVideo.id),
        title: featuredVideo.title,
        category: featuredVideo.category,
        duration: featuredVideo.duration,
        desc: featuredVideo.desc,
      };

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const used = Array.from(new Set(VIDEOS.map((v) => v.category).filter(Boolean)));
    return used.length > 1 ? ["All", ...used] : [];
  }, [VIDEOS]);

  const filtered =
    activeCategory === "All" ? VIDEOS : VIDEOS.filter((v) => v.category === activeCategory);

  const hasFeatured = Boolean(FEATURED.id);
  const youtubeChannelUrl = settings.youtubeUrl?.trim() || "https://youtube.com";

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={bannerSrc}
        imageAlt="Ministry videos"
        eyebrow="Watch & Be Moved"
        title="Video Library"
        bottomColor={c.white}
        variant="cinematic"
        edit={{
          title: "Videos page banner",
          imagePath: ["websiteUseImages", "outreach"],
          imageLabel: "Background photo",
          help: "Replaces the banner behind this title.",
        }}
      />

      <InlineVideosEditor>
        {hasFeatured ? (
          <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
            <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-8"
              >
                <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "#6E9277" }}>
                  Featured
                </p>
                <h2 className="text-2xl lg:text-3xl" style={{ color: c.text }}>
                  {FEATURED.title || "Featured video"}
                </h2>
              </motion.div>
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="lg:col-span-3"
                >
                  <div className="relative rounded-xl overflow-hidden bg-[#474747] aspect-video">
                    <YoutubeEmbed
                      id={FEATURED.id}
                      title={FEATURED.title}
                      className="absolute inset-0 w-full h-full"
                    />
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
                  {FEATURED.category ? (
                    <span
                      className="text-xs px-2.5 py-1 rounded font-semibold text-white mb-3 inline-block"
                      style={{ backgroundColor: "#474747" }}
                    >
                      {FEATURED.category}
                    </span>
                  ) : null}
                  <h3 className="text-xl mb-4" style={{ color: c.text }}>
                    {FEATURED.title}
                  </h3>
                  {FEATURED.desc ? (
                    <p className="text-sm leading-relaxed mb-5" style={{ color: c.muted }}>
                      {FEATURED.desc}
                    </p>
                  ) : null}
                  {FEATURED.duration ? (
                    <p className="text-sm mb-3" style={{ color: c.muted }}>
                      Duration: {FEATURED.duration}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                    <Youtube size={16} style={{ color: "#ff0000" }} />
                    <span>Play directly in this page</span>
                  </div>
                </motion.div>
              </div>
            </div>
            <WaveDivider topColor={c.white} bottomColor={c.cream} />
          </section>
        ) : null}

        <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
          <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-8"
            >
              <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "#6E9277" }}>
                All Videos
              </p>
              <h2 className="text-2xl lg:text-3xl" style={{ color: c.text }}>
                Browse the Collection
              </h2>
            </motion.div>

            {VIDEOS.length === 0 ? (
              <p className="text-center text-sm py-12" style={{ color: c.muted }}>
                No videos yet. Admins can add them with Edit videos on this page.
              </p>
            ) : null}

            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-10">
                {categories.map((cat) => (
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
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((video, i) => (
                <motion.div
                  key={`${video.id}-${i}`}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08 }}
                  className="group"
                >
                  <div className="relative rounded-xl overflow-hidden bg-[#474747] aspect-video mb-3">
                    <YoutubeEmbed
                      id={video.id}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  {video.category ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-semibold text-white mb-1.5 inline-block"
                      style={{ backgroundColor: CATEGORY_COLORS[video.category] || "#6E9277" }}
                    >
                      {video.category}
                    </span>
                  ) : null}
                  <h4 className="text-sm" style={{ color: c.text }}>
                    {video.title}
                  </h4>
                  {video.duration ? (
                    <p className="text-xs mt-1" style={{ color: c.muted }}>
                      {video.duration}
                    </p>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </div>
          <WaveDivider topColor={c.cream} bottomColor={c.white} />
        </section>
      </InlineVideosEditor>

      <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
        <div className={`max-w-xl mx-auto px-5 sm:px-8 ${SECTION_PY} text-center`}>
          <Youtube size={32} className="mx-auto mb-4" style={{ color: "#ff0000" }} />
          <h3 className="text-xl mb-2" style={{ color: c.text }}>
            Subscribe on YouTube
          </h3>
          <p className="text-sm mb-5" style={{ color: c.muted }}>
            Never miss a story. Subscribe to our channel for regular updates from the field.
          </p>
          <a
            href={youtubeChannelUrl}
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
