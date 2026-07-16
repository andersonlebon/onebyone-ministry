/** Suggested starter album names. Admins can rename, delete, or create their own. */
export const SUGGESTED_ALBUM_NAMES = [
  "School Distribution 2023",
  "School Distribution 2024",
  "School Distribution 2025",
  "School Distribution 2026",
  "Water Project",
  "Unity School",
  "Village Life",
  "City Life",
] as const;

export function slugifyAlbumName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
