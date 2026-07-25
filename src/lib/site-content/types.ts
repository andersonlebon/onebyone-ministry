import type { financeDetails } from "@/content/finance";

export type SiteSettings = {
  heroHeadline: string;
  heroSubheadline: string;
  missionStatement: string;
  donatePageHeadline: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  /** Homepage impact stats (editable by client). */
  statCommunities: string;
  statFamilies: string;
  statProjects: string;
  statTeam: string;
  statCommunitiesLabel: string;
  statFamiliesLabel: string;
  statProjectsLabel: string;
  statTeamLabel: string;
  verseText: string;
  verseReference: string;
  usaAddress: string;
  congoAddress: string;
};

export type Post = {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author: string;
  date: string;
  img: string;
  published: boolean;
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  category: string;
  albumId?: string | null;
  albumName?: string | null;
};

export type ProjectStatus = "Active" | "Completed" | "Planned" | "Archived";

export type Project = {
  id: string;
  title: string;
  category: string;
  status: ProjectStatus;
  desc: string;
  fullDesc: string;
  img: string;
  location: string;
  year: string;
  impact: string;
};

export type Video = {
  id: string;
  youtubeId: string;
  title: string;
  category: string;
  duration: string;
  thumb: string;
};

export type DonationMethod =
  | "card"
  | "paypal"
  | "bank"
  | "cash-app"
  | "venmo"
  | "zelle"
  | "check"
  | "crypto"
  | "daf"
  | "other";

export type Donation = {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: "USD";
  method: DonationMethod;
  status: "completed" | "pending" | "approved" | "rejected";
  frequency: "one-time" | "monthly";
  date: string;
  notes: string;
  transactionId?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "viewer";
  addedDate: string;
  addedBy: string;
  lastLogin?: string;
};

export type FinanceDetails = {
  financeEmail: string;
  taxStatus: {
    label: string;
    ein: string;
    taxNote: string;
  };
  bankTransfer: ReadonlyArray<{ label: string; value: string }>;
  mobileGiving: ReadonlyArray<{ label: string; value: string }>;
  crypto: ReadonlyArray<{ coin: string; address: string }>;
  checkByMail: {
    payableTo: string;
    mailingAddress: string;
    memo: string;
  };
  donorAdvisedFund: {
    searchName: string;
    ein: string;
    note: string;
  };
  stockAndSecurities: {
    note: string;
  };
};

/** Lucide icon name stored as a string for About timeline. */
export type AboutIconName = "Heart" | "Users" | "Leaf" | "Star" | "Globe" | "BookOpen";

export type AboutSocialPlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "youtube"
  | "website";

export type AboutSocialLink = {
  id: string;
  platform: AboutSocialPlatform;
  url: string;
};

/** Person card used by Founders, Leadership, and Team Members sections. */
export type AboutPerson = {
  id: string;
  name: string;
  role: string;
  bio: string;
  img: string;
  socialLinks: AboutSocialLink[];
  sortOrder: number;
};

/** @deprecated Use AboutPerson */
export type AboutTeamMember = AboutPerson;

export type AboutPeopleListKey = "founders" | "leadership" | "team";

export type AboutLocation = {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
};

export type AboutTimelineMilestone = {
  id: string;
  year: string;
  title: string;
  desc: string;
  icon: AboutIconName;
  color: string;
  img: string;
  side: "left" | "right";
};

export type AboutRoot = {
  id: string;
  label: string;
  sub: string;
  color: string;
};

/** Full editable About page content (story, people, locations, timeline). */
export type AboutPageContent = {
  storyEyebrow: string;
  storyTitle: string;
  storyBody1: string;
  storyBody2: string;
  storyQuote: string;
  visionText: string;
  missionText: string;
  foundersEyebrow: string;
  foundersTitle: string;
  foundersIntro: string;
  leadershipEyebrow: string;
  leadershipTitle: string;
  leadershipIntro: string;
  teamEyebrow: string;
  teamTitle: string;
  teamIntro: string;
  locationsEyebrow: string;
  locationsTitle: string;
  locationsIntro: string;
  timelineEyebrow: string;
  timelineTitle: string;
  timelineIntro: string;
  timelineFruitLabel: string;
  timelineFruitTitle: string;
  timelineFruitSub: string;
  roots: AboutRoot[];
  founders: AboutPerson[];
  leadership: AboutPerson[];
  team: AboutPerson[];
  locations: AboutLocation[];
  timeline: AboutTimelineMilestone[];
};

export type SiteContentBundle = {
  settings: SiteSettings;
  posts: Post[];
  projects: Project[];
  videos: Video[];
  finance: FinanceDetails;
  about: AboutPageContent;
};

export const EMPTY_FINANCE: FinanceDetails = {
  financeEmail: "",
  taxStatus: { label: "501(c)(3) registered", ein: "", taxNote: "All donations are tax-deductible to the full extent allowed by law." },
  bankTransfer: [
    { label: "Bank Name", value: "" },
    { label: "Account Name", value: "" },
    { label: "Routing Number", value: "" },
    { label: "Account Number", value: "" },
    { label: "Swift / BIC", value: "" },
  ],
  mobileGiving: [
    { label: "Cash App", value: "" },
    { label: "Venmo", value: "" },
    { label: "Zelle", value: "" },
  ],
  crypto: [
    { coin: "Bitcoin (BTC)", address: "" },
    { coin: "Ethereum (ETH)", address: "" },
  ],
  checkByMail: { payableTo: "", mailingAddress: "", memo: "Include your email for a tax receipt." },
  donorAdvisedFund: { searchName: "", ein: "", note: "" },
  stockAndSecurities: { note: "" },
};

export function cloneFinanceDetails(source: typeof financeDetails): FinanceDetails {
  return JSON.parse(JSON.stringify(source)) as FinanceDetails;
}
