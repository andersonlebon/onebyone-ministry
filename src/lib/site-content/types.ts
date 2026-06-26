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
};

export type Project = {
  id: string;
  title: string;
  category: string;
  status: "Active" | "Completed" | "Planned";
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

export type SiteContentBundle = {
  settings: SiteSettings;
  posts: Post[];
  projects: Project[];
  videos: Video[];
  finance: FinanceDetails;
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
