"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { useColors } from "../../../lib/themeStore";
import {
  HERO_IMAGE_CROP_PX,
  HERO_IMAGE_CROP_X_PX,
  getHeroImageOpacity,
  getHeroMainOverlay,
  getHeroSideOverlay,
} from "../../../lib/pageLayout";

import { AnimatedBlob, Sparkles, WaveDivider } from "./SvgDecorators";

type PageHeroProps = {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  bottomColor: string;
  size?: "default" | "compact" | "tall";
  variant?: "standard" | "cinematic";
  children?: ReactNode;
  decorative?: ReactNode;
  animateImage?: boolean;
};

const SIZE_CLASS = {
  default: "h-72 sm:h-80",
  compact: "h-64 sm:h-72",
  tall: "min-h-[18rem] sm:min-h-[22rem]",
} as const;

const CINEMATIC_SIZE_CLASS = "h-72 sm:h-96";

function getCinematicOverlay(isDark: boolean) {
  return isDark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.60), rgba(0,0,0,0.20), rgba(0,0,0,0.75))"
    : "linear-gradient(to bottom, rgba(0,0,0,0.40), transparent, rgba(0,0,0,0.60))";
}

export default function PageHero({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  bottomColor,
  size = "default",
  variant = "standard",
  children,
  decorative,
  animateImage = false,
}: PageHeroProps) {
  const c = useColors();
  const cropTotal = HERO_IMAGE_CROP_PX * 2;
  const cropXTotal = HERO_IMAGE_CROP_X_PX * 2;
  const useAnimation = animateImage || variant === "cinematic";

  if (variant === "cinematic") {
    return (
      <section
        className={`relative flex items-center justify-center overflow-hidden ${CINEMATIC_SIZE_CLASS}`}
        style={{ backgroundColor: c.heroBg }}
      >
        <div
          className="absolute top-0 h-full"
          style={{ width: `calc(100% + ${cropXTotal}px)`, left: "50%", transform: "translateX(-50%)" }}
        >
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: c.isDark ? 0.26 : 0.38 }}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </div>

        <div className="absolute inset-0" style={{ background: getCinematicOverlay(c.isDark) }} />
        <Sparkles count={10} color="#EAC79A" className="inset-0" />
        <AnimatedBlob color="#6E9277" opacity={0.08} size={400} className="-top-20 right-0" />
        {decorative}

        <div className="relative z-10 text-center px-5">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#EAC79A] text-xs tracking-[0.2em] uppercase mb-3"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-4xl lg:text-6xl text-white"
          >
            {title}
          </motion.h1>
          {children}
        </div>

        <WaveDivider topColor="transparent" bottomColor={bottomColor} />
      </section>
    );
  }

  const imageStyle = {
    height: `calc(100% + ${cropTotal}px)`,
    top: `-${HERO_IMAGE_CROP_PX}px`,
    opacity: getHeroImageOpacity(c.isDark),
  };

  const imageClass = "absolute left-0 w-full object-cover";

  return (
    <section
      className={`relative flex flex-col items-center justify-center overflow-hidden ${SIZE_CLASS[size]}`}
      style={{ backgroundColor: c.isDark ? c.heroBg : c.cream }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: c.isDark ? c.heroBg : c.cream }} />
        {useAnimation ? (
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className={imageClass}
            style={imageStyle}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        ) : (
          <img src={imageSrc} alt={imageAlt} className={imageClass} style={imageStyle} />
        )}
      </div>

      <div className="absolute inset-0" style={{ background: getHeroMainOverlay(c.isDark) }} />
      <div className="absolute inset-0" style={{ background: getHeroSideOverlay(c.isDark) }} />

      {decorative}

      <div className={`relative z-10 w-full text-center px-5 ${size === "tall" ? "py-14 lg:py-20" : ""}`}>
        <p
          className="text-xs tracking-[0.2em] uppercase mb-3"
          style={{ color: c.isDark ? "#EAC79A" : "#6E9277" }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-4xl lg:text-5xl leading-tight"
          style={{ color: c.isDark ? "#ffffff" : c.text }}
        >
          {title}
        </h1>
        {children}
      </div>

      <WaveDivider topColor="transparent" bottomColor={bottomColor} />
    </section>
  );
}
