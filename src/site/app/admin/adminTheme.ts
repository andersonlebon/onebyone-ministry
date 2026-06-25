/** Shared Tailwind classes for admin UI — follow globals.css light/dark tokens. */
export const adminPage = {
  bg: "bg-background",
  card: "bg-card",
  cardBorder: "border border-muted",
  text: "text-foreground",
  muted: "text-muted-foreground",
  hover: "hover:bg-muted",
  input:
    "w-full px-3 py-2.5 rounded-xl border border-muted bg-input-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary",
  panel: "bg-card rounded-2xl border border-muted",
} as const;
