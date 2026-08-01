/** Brand / theme tokens the client can pick for each hero line. */
export const HERO_HEADLINE_COLORS = [
  "default",
  "green",
  "gold",
  "burgundy",
  "cream",
  "white",
] as const;

export type HeroHeadlineColor = (typeof HERO_HEADLINE_COLORS)[number];

export type HeroHeadlineLine = {
  text: string;
  color: HeroHeadlineColor;
};

export const HERO_HEADLINE_COLOR_LABELS: Record<HeroHeadlineColor, string> = {
  default: "Default",
  green: "Green",
  gold: "Gold",
  burgundy: "Burgundy",
  cream: "Cream",
  white: "White",
};

/** Fixed swatches shown in the editor (default uses the live theme text color at render time). */
export const HERO_HEADLINE_COLOR_SWATCHES: Record<HeroHeadlineColor, string> = {
  default: "#474747",
  green: "#6E9277",
  gold: "#EAC79A",
  burgundy: "#5A4749",
  cream: "#EFE7DB",
  white: "#ffffff",
};

export const MAX_HERO_HEADLINE_LINES = 4;

export function isHeroHeadlineColor(value: unknown): value is HeroHeadlineColor {
  return typeof value === "string" && (HERO_HEADLINE_COLORS as readonly string[]).includes(value);
}

/** Resolve a line color token against the live theme. */
export function resolveHeroHeadlineColor(
  color: HeroHeadlineColor | undefined,
  theme: { text: string; isDark: boolean; cream: string }
): string {
  switch (color) {
    case "green":
      return "#6E9277";
    case "gold":
      return "#EAC79A";
    case "burgundy":
      return "#5A4749";
    case "cream":
      return theme.cream;
    case "white":
      return "#ffffff";
    case "default":
    default:
      return theme.isDark ? "#ffffff" : theme.text;
  }
}

function cleanLineText(text: string): string {
  return text.replace(/\s*One By One\s*$/i, "").replace(/\s+/g, " ").trim();
}

/** Prefer structured lines; fall back to the legacy single headline string. */
export function getHeroHeadlineLines(settings: {
  heroHeadline?: string;
  heroHeadlineLines?: HeroHeadlineLine[] | null;
}): HeroHeadlineLine[] {
  const fromLines = (settings.heroHeadlineLines ?? [])
    .map((line) => ({
      text: cleanLineText(typeof line?.text === "string" ? line.text : ""),
      color: isHeroHeadlineColor(line?.color) ? line.color : ("default" as const),
    }))
    .filter((line) => line.text.length > 0)
    .slice(0, MAX_HERO_HEADLINE_LINES);

  if (fromLines.length > 0) return fromLines;

  const legacy = cleanLineText(settings.heroHeadline ?? "");
  if (!legacy) return [];
  return [{ text: legacy, color: "default" }];
}

/** Keep `heroHeadline` in sync for previews and older admin fields. */
export function syncHeroHeadlineFromLines(lines: HeroHeadlineLine[]): string {
  return lines
    .map((line) => line.text.trim())
    .filter(Boolean)
    .slice(0, MAX_HERO_HEADLINE_LINES)
    .join(" ");
}

export function normalizeHeroHeadlineLines(lines: unknown): HeroHeadlineLine[] {
  if (!Array.isArray(lines)) return [];
  return lines
    .slice(0, MAX_HERO_HEADLINE_LINES)
    .map((line) => {
      const text = typeof line?.text === "string" ? line.text.trim() : "";
      const color = isHeroHeadlineColor(line?.color) ? line.color : "default";
      return { text, color };
    })
    .filter((line) => line.text.length > 0);
}

export function emptyHeroHeadlineLine(): HeroHeadlineLine {
  return { text: "", color: "default" };
}
