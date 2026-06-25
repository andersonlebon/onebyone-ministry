import type { FinanceDetails, Post, Project, SiteSettings } from "@/lib/site-content/types";
import {
  hasAlternativeGivingDetails,
  hasBankDetails,
  hasMobileGivingDetails,
} from "@/lib/donate/payment-links";
import type { PaymentEnvStatus } from "@/lib/donate/payment-env-types";

export type ReadinessItem = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  href: string;
  priority: "critical" | "important" | "optional";
};

function hasFinanceConfigured(finance: FinanceDetails) {
  return Boolean(
    finance.financeEmail.trim() ||
      finance.taxStatus.ein.trim() ||
      hasBankDetails(finance) ||
      hasMobileGivingDetails(finance) ||
      hasAlternativeGivingDetails(finance)
  );
}

function hasSocialLinks(settings: SiteSettings) {
  return Boolean(settings.facebookUrl.trim() || settings.instagramUrl.trim() || settings.youtubeUrl.trim());
}

function hasPlaceholderStoryBody(posts: Post[]) {
  return posts.some((p) => /full story body goes here/i.test(p.body) || p.body.trim().length < 40);
}

export function buildDashboardReadiness(input: {
  settings: SiteSettings;
  posts: Post[];
  projects: Project[];
  videoCount: number;
  finance: FinanceDetails;
  paymentEnv?: PaymentEnvStatus;
}): ReadinessItem[] {
  const { settings, posts, projects, videoCount, finance, paymentEnv } = input;
  const publishedCount = posts.filter((p) => p.published).length;

  return [
    {
      id: "contact-phone",
      label: "Contact phone number",
      detail: settings.contactPhone.trim()
        ? settings.contactPhone
        : "Add your real phone in Site Settings. It appears in the footer and contact page.",
      done: Boolean(settings.contactPhone.trim()),
      href: "/admin/settings",
      priority: "critical",
    },
    {
      id: "contact-email",
      label: "Contact email",
      detail: settings.contactEmail.trim()
        ? settings.contactEmail
        : "Set the public contact email in Site Settings.",
      done: Boolean(settings.contactEmail.trim()),
      href: "/admin/settings",
      priority: "critical",
    },
    {
      id: "social-links",
      label: "Social media profiles",
      detail: hasSocialLinks(settings)
        ? "Facebook, Instagram, or YouTube link is set."
        : "Add at least one social profile URL in Site Settings.",
      done: hasSocialLinks(settings),
      href: "/admin/settings",
      priority: "critical",
    },
    {
      id: "finance",
      label: "Finance & giving details",
      detail: hasFinanceConfigured(finance)
        ? "Bank, mobile, check, crypto, or DAF info saved for the donate page."
        : "Add EIN, bank, Venmo/Cash App/Zelle, and other giving instructions in Finance.",
      done: hasFinanceConfigured(finance),
      href: "/admin/finance",
      priority: "critical",
    },
    {
      id: "finance-email",
      label: "Finance receipt email",
      detail: finance.financeEmail.trim()
        ? finance.financeEmail
        : "Set a finance email so donors can request tax receipts from Venmo, Zelle, and other methods.",
      done: Boolean(finance.financeEmail.trim()),
      href: "/admin/finance",
      priority: "important",
    },
    {
      id: "mobile-giving",
      label: "Mobile giving (Venmo / Cash App / Zelle)",
      detail: hasMobileGivingDetails(finance)
        ? "At least one mobile giving handle is set for the donate page."
        : "Add Venmo, Cash App, or Zelle details in Finance for mobile donors.",
      done: hasMobileGivingDetails(finance),
      href: "/admin/finance",
      priority: "important",
    },
    {
      id: "hero-copy",
      label: "Homepage hero copy",
      detail: settings.heroHeadline.trim()
        ? "Hero headline and subheadline are set."
        : "Review homepage headline and mission text in Site Settings.",
      done: Boolean(settings.heroHeadline.trim() && settings.heroSubheadline.trim()),
      href: "/admin/settings",
      priority: "important",
    },
    {
      id: "published-stories",
      label: "Published stories",
      detail:
        publishedCount > 0
          ? `${publishedCount} published ${publishedCount === 1 ? "story" : "stories"} on the public site.`
          : "Publish at least one story so /stories is not empty.",
      done: publishedCount > 0,
      href: "/admin/posts",
      priority: "important",
    },
    {
      id: "story-bodies",
      label: "Story content reviewed",
      detail: hasPlaceholderStoryBody(posts)
        ? "Some posts still have placeholder body text. Replace with full stories."
        : posts.length === 0
          ? "Add blog posts when you are ready to publish field updates."
          : "Story bodies look filled in.",
      done: posts.length > 0 && !hasPlaceholderStoryBody(posts),
      href: "/admin/posts",
      priority: "important",
    },
    {
      id: "projects",
      label: "Projects on the site",
      detail:
        projects.length > 0
          ? `${projects.length} ${projects.length === 1 ? "project" : "projects"} listed publicly.`
          : "Add or edit projects so /projects reflects your current work.",
      done: projects.length > 0,
      href: "/admin/projects",
      priority: "important",
    },
    {
      id: "photos",
      label: "Photo gallery",
      detail: "Upload original photos in Photo Library. They sync to the public gallery automatically.",
      done: false,
      href: "/admin/photos",
      priority: "important",
    },
    {
      id: "videos",
      label: "Video library",
      detail:
        videoCount > 0
          ? `${videoCount} ${videoCount === 1 ? "video" : "videos"} in the library.`
          : "Add YouTube videos in the Videos admin section.",
      done: videoCount > 0,
      href: "/admin/videos",
      priority: "important",
    },
    {
      id: "newsletter",
      label: "Newsletter (Brevo)",
      detail: "Footer and site forms subscribe via Brevo when NEWSLETTER_PROVIDER=brevo is set on Vercel.",
      done: false,
      href: "/admin/settings",
      priority: "optional",
    },
    {
      id: "stripe",
      label: "Online giving (Stripe)",
      detail: paymentEnv?.stripeKeys
        ? paymentEnv.stripeWebhook
          ? "Stripe keys and webhook secret are set for card checkout and donation logging."
          : "Stripe keys are set. Add STRIPE_WEBHOOK_SECRET so completed card gifts sync to Donations."
        : "Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY on Vercel for card checkout.",
      done: Boolean(paymentEnv?.stripeKeys && paymentEnv?.stripeWebhook),
      href: "/admin/donations",
      priority: "optional",
    },
  ];
}

export function readinessSummary(items: ReadinessItem[]) {
  const trackable = items.filter((i) => i.id !== "photos" && i.id !== "newsletter" && i.id !== "stripe");
  const done = trackable.filter((i) => i.done).length;
  return { done, total: trackable.length };
}
