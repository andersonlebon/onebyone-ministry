import { BookOpen, Heart, Lightbulb, Users, type LucideIcon } from "lucide-react";
import type { HomePillarIcon } from "@/lib/media/types";

const MAP: Record<HomePillarIcon, LucideIcon> = {
  BookOpen,
  Lightbulb,
  Heart,
  Users,
};

export function pillarIcon(name: HomePillarIcon | string | undefined): LucideIcon {
  if (name && name in MAP) return MAP[name as HomePillarIcon];
  return BookOpen;
}
