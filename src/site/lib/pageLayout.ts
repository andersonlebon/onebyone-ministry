/** Standard vertical padding for page section content containers. */
export const SECTION_PY = "py-14 lg:py-20";

/** Hero background image vertical crop (px per edge). */
export const HERO_IMAGE_CROP_PX = 65;

/** Hero background image horizontal crop (px per edge), About-style heroes. */
export const HERO_IMAGE_CROP_X_PX = 100;

export function getHeroImageOpacity(isDark: boolean) {
  return isDark ? 0.18 : 0.45;
}

export function getHeroMainOverlay(isDark: boolean) {
  return isDark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.68) 100%)"
    : "linear-gradient(to bottom, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0.62) 100%)";
}

export function getHeroSideOverlay(isDark: boolean) {
  return isDark
    ? "linear-gradient(to right, rgba(0,0,0,0.20) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)"
    : "linear-gradient(to right, rgba(255,255,255,0.26) 0%, transparent 50%, rgba(255,255,255,0.14) 100%)";
}
