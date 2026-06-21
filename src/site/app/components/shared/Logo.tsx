"use client";

import Image from "next/image";
import { brandAssets } from "@/content/media";

/**
 * Official One By One Ministries logos from Brand Transparent zip.
 * Matches figma-make imports/5.png, 6.png, 7.png paths.
 */
export default function Logo({
  variant = "dark",
  className = "",
  style,
}: {
  variant?: "light" | "dark" | "vertical-dark" | "vertical-light";
  className?: string;
  style?: React.CSSProperties;
}) {
  const src =
    variant === "light"
      ? brandAssets.logoWhite
      : variant === "vertical-light"
        ? brandAssets.logoVerticalWhite
      : variant === "vertical-dark"
        ? brandAssets.logoVertical
        : brandAssets.logoDark;

  const isVertical = variant === "vertical-dark" || variant === "vertical-light";

  return (
    <Image
      src={src}
      alt="One By One Ministries"
      width={isVertical ? 300 : 420}
      height={isVertical ? 300 : 120}
      sizes={isVertical ? "(max-width: 768px) 180px, 260px" : "(max-width: 768px) 160px, 420px"}
      className={`object-contain ${className}`}
      style={{
        height: isVertical ? "clamp(120px, 22vw, 260px)" : "clamp(44px, 6vw, 60px)",
        width: "auto",
        ...style,
      }}
      priority={variant === "light"}
    />
  );
}
