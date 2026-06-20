"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { galleryPhotos, localImages, ministryVideos, storyImages } from "@/content/media";

/* ─── Types ─── */
export type Post = {
  id: string;
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

export type Donation = {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: "USD";
  method: "card" | "paypal" | "bank" | "cash-app" | "venmo" | "zelle" | "check" | "crypto" | "daf" | "other";
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

const DEFAULT_DONATIONS: Donation[] = [
  { id: "d1", name: "James Thompson", email: "james@email.com", amount: 250, currency: "USD", method: "card", status: "completed", frequency: "one-time", date: "June 8, 2025", notes: "", transactionId: "ch_3abc123" },
  { id: "d2", name: "Marie Dubois", email: "marie@email.com", amount: 100, currency: "USD", method: "paypal", status: "completed", frequency: "monthly", date: "June 5, 2025", notes: "Monthly supporter", transactionId: "PAYPAL-789" },
  { id: "d3", name: "Emmanuel Kalala", email: "e.kalala@gmail.com", amount: 500, currency: "USD", method: "bank", status: "pending", frequency: "one-time", date: "June 3, 2025", notes: "Wire transfer from Congo - please verify", transactionId: "" },
  { id: "d4", name: "Sarah Johnson", email: "sarah.j@church.org", amount: 1000, currency: "USD", method: "check", status: "pending", frequency: "one-time", date: "June 1, 2025", notes: "Check #4521 mailed to Atlanta office" },
  { id: "d5", name: "Pierre Martin", email: "pierre@email.fr", amount: 50, currency: "USD", method: "venmo", status: "approved", frequency: "monthly", date: "May 28, 2025", notes: "Monthly via Venmo @pierre-martin" },
  { id: "d6", name: "Grace Community Church", email: "admin@gracechurch.org", amount: 5000, currency: "USD", method: "bank", status: "approved", frequency: "one-time", date: "May 20, 2025", notes: "Annual church partnership gift" },
  { id: "d7", name: "Anonymous", email: "anon@email.com", amount: 25, currency: "USD", method: "crypto", status: "completed", frequency: "one-time", date: "May 15, 2025", notes: "Bitcoin donation, converted to USD" },
  { id: "d8", name: "Robert Williams", email: "r.williams@corp.com", amount: 2500, currency: "USD", method: "daf", status: "completed", frequency: "one-time", date: "May 10, 2025", notes: "Donor-Advised Fund disbursement via Fidelity Charitable" },
];

const DEFAULT_ADMINS: AdminUser[] = [
  { id: "a1", name: "Emmanuel Tshilobo", email: "admin@obom.org", role: "super-admin", addedDate: "January 1, 2015", addedBy: "System", lastLogin: "Today" },
];

type StoreCtx = {
  posts: Post[];
  photos: Photo[];
  projects: Project[];
  videos: Video[];
  donations: Donation[];
  admins: AdminUser[];
  settings: SiteSettings;
  addPost: (p: Omit<Post, "id">) => void;
  updatePost: (id: string, p: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addPhoto: (p: Omit<Photo, "id">) => void;
  updatePhoto: (id: string, p: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addVideo: (v: Omit<Video, "id">) => void;
  updateVideo: (id: string, v: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  updateSettings: (s: Partial<SiteSettings>) => void;
  addDonation: (d: Omit<Donation, "id">) => void;
  updateDonation: (id: string, d: Partial<Donation>) => void;
  deleteDonation: (id: string) => void;
  addAdmin: (a: Omit<AdminUser, "id">) => void;
  updateAdmin: (id: string, a: Partial<AdminUser>) => void;
  deleteAdmin: (id: string) => void;
};

const DEFAULT_SETTINGS: SiteSettings = {
  heroHeadline: "Bringing Hope, Education, and the Love of Christ One By One",
  heroSubheadline: "Transforming communities in the Democratic Republic of Congo through Education, Entrepreneurship, and Spiritual Discipleship — one person at a time.",
  missionStatement: "One By One Ministries is dedicated to rebuilding communities through Education, Entrepreneurship, and Spiritual Discipleship. We seek to change the world one person, one community, and one country at a time through the power of the Holy Spirit and the Word of God.",
  donatePageHeadline: "Give to Change a Life in Congo",
  contactEmail: "info@onebyone.org",
  contactPhone: "+1 (555) 555-0100",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
};

const DEFAULT_POSTS: Post[] = [
  { id: "1", title: "How One School Changed a Whole Village", excerpt: "When Amara received her first textbook at 11, she said it was the most beautiful thing she'd ever seen.", body: "Full story body goes here...", category: "Education", author: "Sarah M.", date: "May 28, 2025", img: storyImages[0], published: true },
  { id: "2", title: "Pastor Thomas's Testimony", excerpt: "One discipleship meeting sparked a revival reaching five surrounding villages.", body: "Full story body goes here...", category: "Discipleship", author: "Emmanuel T.", date: "April 14, 2025", img: storyImages[1], published: true },
  { id: "3", title: "Mamas Building a Future", excerpt: "28 women graduated from the Cohort, now running businesses.", body: "Full story body goes here...", category: "Entrepreneurship", author: "Jonathan K.", date: "March 3, 2025", img: storyImages[2], published: true },
];

const DEFAULT_PHOTOS: Photo[] = galleryPhotos.slice(0, 6).map((p) => ({
  id: String(p.id),
  src: p.src,
  alt: p.alt,
  category: p.category,
}));

const DEFAULT_PROJECTS: Project[] = [
  { id: "1", title: "Rural School Building Initiative", category: "Education", status: "Active", desc: "Constructing classrooms for 200+ children.", fullDesc: "Full description...", img: localImages.education, location: "Kinshasa Province", year: "2024–2025", impact: "200+ children" },
  { id: "2", title: "Women's Entrepreneurship Cohort", category: "Entrepreneurship", status: "Active", desc: "12-week skills program for 30 women.", fullDesc: "Full description...", img: localImages.entrepreneurship, location: "Kasai Province", year: "2023–Ongoing", impact: "90+ graduates" },
  { id: "3", title: "Village Pastoral Training", category: "Discipleship", status: "Active", desc: "Equipping rural pastors with theological education.", fullDesc: "Full description...", img: localImages.discipleship, location: "Multiple Provinces", year: "2021–Ongoing", impact: "45+ pastors" },
];

const DEFAULT_VIDEOS: Video[] = ministryVideos.map((v, i) => ({
  id: String(i + 1),
  youtubeId: v.id,
  title: v.title,
  category: v.category,
  duration: v.duration || "—",
  thumb: v.thumb,
}));

const StoreContext = createContext<StoreCtx>({} as StoreCtx);

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore quota errors */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function SiteStoreProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => load("obom_posts", DEFAULT_POSTS));
  const [photos, setPhotos] = useState<Photo[]>(() => load("obom_photos", DEFAULT_PHOTOS));
  const [projects, setProjects] = useState<Project[]>(() => load("obom_projects", DEFAULT_PROJECTS));
  const [videos, setVideos] = useState<Video[]>(() => load("obom_videos", DEFAULT_VIDEOS));
  const [donations, setDonations] = useState<Donation[]>(() => load("obom_donations", DEFAULT_DONATIONS));
  const [admins, setAdmins] = useState<AdminUser[]>(() => load("obom_admins", DEFAULT_ADMINS));
  const [settings, setSettings] = useState<SiteSettings>(() => load("obom_settings", DEFAULT_SETTINGS));

  useEffect(() => { save("obom_posts", posts); }, [posts]);
  useEffect(() => { save("obom_photos", photos); }, [photos]);
  useEffect(() => { save("obom_projects", projects); }, [projects]);
  useEffect(() => { save("obom_videos", videos); }, [videos]);
  useEffect(() => { save("obom_donations", donations); }, [donations]);
  useEffect(() => { save("obom_admins", admins); }, [admins]);
  useEffect(() => { save("obom_settings", settings); }, [settings]);

  const addPost = useCallback((p: Omit<Post, "id">) => setPosts((prev) => [{ ...p, id: uid() }, ...prev]), []);
  const updatePost = useCallback((id: string, p: Partial<Post>) => setPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), []);
  const deletePost = useCallback((id: string) => setPosts((prev) => prev.filter((x) => x.id !== id)), []);

  const addPhoto = useCallback((p: Omit<Photo, "id">) => setPhotos((prev) => [{ ...p, id: uid() }, ...prev]), []);
  const updatePhoto = useCallback((id: string, p: Partial<Photo>) => setPhotos((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), []);
  const deletePhoto = useCallback((id: string) => setPhotos((prev) => prev.filter((x) => x.id !== id)), []);

  const addProject = useCallback((p: Omit<Project, "id">) => setProjects((prev) => [{ ...p, id: uid() }, ...prev]), []);
  const updateProject = useCallback((id: string, p: Partial<Project>) => setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), []);
  const deleteProject = useCallback((id: string) => setProjects((prev) => prev.filter((x) => x.id !== id)), []);

  const addVideo = useCallback((v: Omit<Video, "id">) => setVideos((prev) => [{ ...v, id: uid() }, ...prev]), []);
  const updateVideo = useCallback((id: string, v: Partial<Video>) => setVideos((prev) => prev.map((x) => (x.id === id ? { ...x, ...v } : x))), []);
  const deleteVideo = useCallback((id: string) => setVideos((prev) => prev.filter((x) => x.id !== id)), []);

  const updateSettings = useCallback((s: Partial<SiteSettings>) => setSettings((prev) => ({ ...prev, ...s })), []);
  const addDonation = useCallback((d: Omit<Donation, "id">) => setDonations((prev) => [{ ...d, id: uid() }, ...prev]), []);
  const updateDonation = useCallback((id: string, d: Partial<Donation>) => setDonations((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x))), []);
  const deleteDonation = useCallback((id: string) => setDonations((prev) => prev.filter((x) => x.id !== id)), []);
  const addAdmin = useCallback((a: Omit<AdminUser, "id">) => setAdmins((prev) => [...prev, { ...a, id: uid() }]), []);
  const updateAdmin = useCallback((id: string, a: Partial<AdminUser>) => setAdmins((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x))), []);
  const deleteAdmin = useCallback((id: string) => setAdmins((prev) => prev.filter((x) => x.id !== id)), []);

  return (
    <StoreContext.Provider
      value={{
        posts,
        photos,
        projects,
        videos,
        donations,
        admins,
        settings,
        addPost,
        updatePost,
        deletePost,
        addPhoto,
        updatePhoto,
        deletePhoto,
        addProject,
        updateProject,
        deleteProject,
        addVideo,
        updateVideo,
        deleteVideo,
        updateSettings,
        addDonation,
        updateDonation,
        deleteDonation,
        addAdmin,
        updateAdmin,
        deleteAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useSiteStore = () => useContext(StoreContext);
