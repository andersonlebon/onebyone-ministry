import { galleryPhotos } from "@/content/media";
import { defaultSiteSettings } from "@/content/site-defaults";
import { isDemoContentEnabled } from "@/lib/runtime-env";

import type { AdminUser, Donation, Photo, Post, Project, SiteSettings, Video } from "@/lib/site-content/types";

const DEMO_DONATIONS: Donation[] = [
  { id: "d1", name: "James Thompson", email: "james@email.com", amount: 250, currency: "USD", method: "card", status: "completed", frequency: "one-time", date: "June 8, 2025", notes: "", transactionId: "ch_3abc123" },
  { id: "d2", name: "Marie Dubois", email: "marie@email.com", amount: 100, currency: "USD", method: "paypal", status: "completed", frequency: "monthly", date: "June 5, 2025", notes: "Monthly supporter", transactionId: "PAYPAL-789" },
  { id: "d3", name: "Emmanuel Kalala", email: "e.kalala@gmail.com", amount: 500, currency: "USD", method: "bank", status: "pending", frequency: "one-time", date: "June 3, 2025", notes: "Wire transfer from Congo - please verify", transactionId: "" },
  { id: "d4", name: "Sarah Johnson", email: "sarah.j@church.org", amount: 1000, currency: "USD", method: "check", status: "pending", frequency: "one-time", date: "June 1, 2025", notes: "Check #4521 mailed to Atlanta office" },
  { id: "d5", name: "Pierre Martin", email: "pierre@email.fr", amount: 50, currency: "USD", method: "venmo", status: "approved", frequency: "monthly", date: "May 28, 2025", notes: "Monthly via Venmo @pierre-martin" },
  { id: "d6", name: "Grace Community Church", email: "admin@gracechurch.org", amount: 5000, currency: "USD", method: "bank", status: "approved", frequency: "one-time", date: "May 20, 2025", notes: "Annual church partnership gift" },
  { id: "d7", name: "Anonymous", email: "anon@email.com", amount: 25, currency: "USD", method: "crypto", status: "completed", frequency: "one-time", date: "May 15, 2025", notes: "Bitcoin donation, converted to USD" },
  { id: "d8", name: "Robert Williams", email: "r.williams@corp.com", amount: 2500, currency: "USD", method: "daf", status: "completed", frequency: "one-time", date: "May 10, 2025", notes: "Donor-Advised Fund disbursement via Fidelity Charitable" },
];

const DEMO_ADMINS: AdminUser[] = [
  { id: "a1", name: "Emmanuel Tshilobo", email: "admin@obom.org", role: "super-admin", addedDate: "January 1, 2015", addedBy: "System", lastLogin: "Today" },
];

export const DEMO_MONTHLY_ANALYTICS = [
  { month: "Jan", amount: 3200, donors: 8 },
  { month: "Feb", amount: 4800, donors: 12 },
  { month: "Mar", amount: 3900, donors: 9 },
  { month: "Apr", amount: 6200, donors: 15 },
  { month: "May", amount: 8750, donors: 18 },
  { month: "Jun", amount: 9500, donors: 22 },
];

export function getInitialSiteSettings(): SiteSettings {
  return { ...defaultSiteSettings };
}

export function getInitialPosts(): Post[] {
  return [];
}

export function getInitialPhotos(): Photo[] {
  if (!isDemoContentEnabled()) return [];
  return galleryPhotos.slice(0, 6).map((p) => ({
    id: String(p.id),
    src: p.src,
    alt: p.alt,
    category: p.category,
  }));
}

export function getInitialProjects(): Project[] {
  return [];
}

export function getInitialVideos(): Video[] {
  return [];
}

export function getInitialDonations(): Donation[] {
  return isDemoContentEnabled() ? DEMO_DONATIONS : [];
}

export function getInitialAdmins(): AdminUser[] {
  return isDemoContentEnabled() ? DEMO_ADMINS : [];
}
