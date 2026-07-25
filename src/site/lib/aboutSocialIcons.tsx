import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import type { AboutSocialPlatform } from "@/lib/site-content/types";

export function aboutSocialIcon(platform: AboutSocialPlatform): LucideIcon {
  switch (platform) {
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    case "linkedin":
      return Linkedin;
    case "x":
      return Twitter;
    case "youtube":
      return Youtube;
    default:
      return Globe;
  }
}
