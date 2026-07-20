"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useColors } from "../../lib/themeStore";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { X, ZoomIn, ChevronLeft, ChevronRight, ArrowLeft, Images } from "lucide-react";
import { useMediaUrl, usePhotoAlbums, useSiteMedia } from "@/site/lib/mediaContext";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

export default function PhotosPage() {
  const c = useColors();
  const { galleryPhotos, websiteUseImages } = useSiteMedia();
  const albums = usePhotoAlbums();
  const bannerSrc = useMediaUrl(websiteUseImages.community);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const albumCards = useMemo(() => {
    return albums
      .map((album) => {
        const photos = galleryPhotos.filter((p) => p.albumId === album.id);
        return {
          ...album,
          count: photos.length,
          cover: photos[0]?.src ?? null,
        };
      })
      .filter((a) => a.count > 0);
  }, [albums, galleryPhotos]);

  const unassigned = useMemo(
    () => galleryPhotos.filter((p) => !p.albumId),
    [galleryPhotos]
  );

  const activeAlbum = albums.find((a) => a.id === activeAlbumId) ?? null;
  const albumPhotos =
    activeAlbumId === "__unassigned__"
      ? unassigned
      : activeAlbumId
        ? galleryPhotos.filter((p) => p.albumId === activeAlbumId)
        : [];

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  const goNext = () =>
    setLightboxIndex((prev) => (prev !== null && prev < albumPhotos.length - 1 ? prev + 1 : prev));

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={bannerSrc}
        imageAlt="Ministry photos"
        eyebrow="Visual Stories"
        title="Photo Gallery"
        bottomColor={c.cream}
        variant="cinematic"
        edit={{
          title: "Photos page banner",
          imagePath: ["websiteUseImages", "community"],
          imageLabel: "Background photo",
          help: "Banner only. Gallery photos are managed in Photo Library albums.",
        }}
      />

      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 lg:px-8 ${SECTION_PY}`}>
          {!activeAlbumId ? (
            <>
              <div className="text-center mb-10">
                <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "#6E9277" }}>
                  Browse by album
                </p>
                <h2 className="text-2xl lg:text-3xl" style={{ color: c.text }}>
                  Choose an album to see the photos
                </h2>
              </div>

              {albumCards.length === 0 && unassigned.length === 0 ? (
                <p className="text-center text-sm py-16" style={{ color: c.muted }}>
                  Photos will appear here once albums are added.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albumCards.map((album, i) => (
                    <motion.button
                      key={album.id}
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveAlbumId(album.id)}
                      className="text-left rounded-2xl overflow-hidden group"
                      style={{ backgroundColor: c.white, border: `1px solid ${c.borderLight}` }}
                    >
                      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: c.borderLight }}>
                        {album.cover ? (
                          <img
                            src={album.cover}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Images size={32} style={{ color: "#6E9277" }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-semibold text-lg">{album.name}</p>
                          <p className="text-white/80 text-xs">{album.count} photo{album.count === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {unassigned.length > 0 ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setActiveAlbumId("__unassigned__")}
                      className="text-left rounded-2xl overflow-hidden"
                      style={{ backgroundColor: c.white, border: `1px solid ${c.borderLight}` }}
                    >
                      <div className="relative h-48 overflow-hidden" style={{ backgroundColor: c.borderLight }}>
                        <img
                          src={unassigned[0].src}
                          alt="Other photos"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-semibold text-lg">Other photos</p>
                          <p className="text-white/80 text-xs">{unassigned.length} photo{unassigned.length === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                    </motion.button>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveAlbumId(null);
                  setLightboxIndex(null);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold mb-8"
                style={{ color: "#6E9277" }}
              >
                <ArrowLeft size={16} /> All albums
              </button>
              <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: c.text }}>
                {activeAlbumId === "__unassigned__" ? "Other photos" : activeAlbum?.name ?? "Album"}
              </h2>

              {albumPhotos.length === 0 ? (
                <p className="text-center text-sm py-16" style={{ color: c.muted }}>
                  No photos in this album yet.
                </p>
              ) : (
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3 }}>
                  <Masonry gutter="16px">
                    {albumPhotos.map((photo, i) => (
                      <motion.div
                        key={`${photo.src}-${i}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
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
                      </motion.div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              )}
            </>
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
            <button className="absolute top-5 right-5 text-white/80 hover:text-white" onClick={closeLightbox}>
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
            {lightboxIndex < albumPhotos.length - 1 && (
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
              src={albumPhotos[lightboxIndex]?.src}
              alt={albumPhotos[lightboxIndex]?.alt ?? ""}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
