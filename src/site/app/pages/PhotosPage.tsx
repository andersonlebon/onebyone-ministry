"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useColors } from "../../lib/themeStore";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteMedia } from "@/site/lib/mediaContext";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

const CATEGORIES = ["All", "Education", "Community", "Worship", "Outreach"];

export default function PhotosPage() {
  const c = useColors();
  const { galleryPhotos, websiteUseImages } = useSiteMedia();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === "All"
    ? galleryPhotos
    : galleryPhotos.filter((p) => p.category === activeCategory);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  const goNext = () => setLightboxIndex((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : prev));

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={websiteUseImages.community}
        imageAlt="Ministry photos"
        eyebrow="Visual Stories"
        title="Photo Gallery"
        bottomColor={c.cream}
        variant="cinematic"
      />

      {/* Gallery */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 lg:px-8 ${SECTION_PY}`}>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
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

          {/* Masonry */}
          <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3 }}>
            <Masonry gutter="16px">
              {filtered.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative group cursor-pointer rounded-lg overflow-hidden"
                  style={{ backgroundColor: c.borderLight }}
                  onClick={() => openLightbox(i)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
                    <span className="text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#6E9277" }}>
                      {photo.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.footer} />
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <X size={18} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl max-h-[85vh] mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filtered[lightboxIndex]?.src.replace("w=700", "w=1200")}
                alt={filtered[lightboxIndex]?.alt}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-white/60 text-sm text-center mt-3">{filtered[lightboxIndex]?.alt}</p>
            </motion.div>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs">
              {lightboxIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
