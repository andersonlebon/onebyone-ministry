import { BookOpen, Globe, Heart, Leaf, Star, Users, type LucideIcon } from "lucide-react";
import type { AboutIconName } from "@/lib/site-content/types";

const MAP: Record<AboutIconName, LucideIcon> = {
  Heart,
  Users,
  Leaf,
  Star,
  Globe,
  BookOpen,
};

export function aboutIcon(name: AboutIconName | string | undefined): LucideIcon {
  if (name && name in MAP) return MAP[name as AboutIconName];
  return Star;
}
