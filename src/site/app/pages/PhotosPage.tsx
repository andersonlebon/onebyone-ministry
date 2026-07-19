"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useColors } from "../../lib/themeStore";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaUrl, usePhotoAlbums, useSiteMedia } from "@/site/lib/mediaContext";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

export default function PhotosPage() {
  const c = useColors();
  const { galleryPhotos, websiteUseImages } = useSiteMedia();
  const albums = usePhotoAlbums();
  const bannerSrc = useMediaUrl(websiteUseImages.community);
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const albumsWithPhotos = useMemo(() => {
    const used = new Set(
      galleryPhotos.map((p) => p.albumId).filter((id): id is string => Boolean(id))
    );
    return albums.filter((a) => used.has(a.id));
  }, [albums, galleryPhotos]);

  const filters = useMemo(
    () => [{ id: "All", name: "All" }, ...albumsWithPhotos.map((a) => ({ id: a.id, name: a.name }))],
    [albumsWithPhotos]
  );

  const filtered =
    activeAlbum === "All"
      ? galleryPhotos
      : galleryPhotos.filter((p) => p.albumId === activeAlbum);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  const goNext = () =>
    setLightboxIndex((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : prev));

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={bannerSrc}
        imageAlt="Ministry photos"
        eyebrow="Visual Stories"
        title="Photo Gallery"
        bottomColor={c.cream}
        variant="cinematic"
      />

      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 lg:px-8 ${SECTION_PY}`}>
          {filters.length > 1 ? (
            <div className="flex flex-wrap gap-2 mb-10">
              {filters.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setActiveAlbum(album.id)}
                  className="px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: activeAlbum === album.id ? "#6E9277" : c.white,
                    color: activeAlbum === album.id ? "#ffffff" : c.text,
                    border: activeAlbum === album.id ? "none" : `1px solid ${c.borderLight}`,
                  }}
                >
                  {album.name}
                </button>
              ))}
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="text-center text-sm py-16" style={{ color: c.muted }}>
              {galleryPhotos.length === 0
                ? "Photos will appear here once they are added."
                : "No photos in this album yet. Check back soon."}
            </p>
          ) : (
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3 }}>
              <Masonry gutter="16px">
                {filtered.map((photo, i) => (
                  <motion.div
                    key={`${photo.src}-${i}`}
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
                      <ZoomIn
                        size={28}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    {photo.albumName ? (
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
                        <span
                          className="text-white text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: "#6E9277" }}
                        >
                          {photo.albumName}
                        </span>
                      </div>
                    ) : null}
                  </motion.div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.footer} />
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
            onClick={closeLightbox}
          >
            <button
              className="absolute top-5 right-5 text-white/80 hover:text-white"
              onClick={closeLightbox}
            >
              <X size={28} />
            </button>
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft size={36} />
              </button>
            )}
            {lightboxIndex < filtered.length - 1 && (
              <button
                className="absolute right-4 text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight size={36} />
              </button>
            )}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={filtered[lightboxIndex]?.src}
              alt={filtered[lightboxIndex]?.alt ?? ""}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
