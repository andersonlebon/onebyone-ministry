"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

import {
  createDonationAction,
  deleteDonationAction,
  updateDonationAction,
} from "@/app/actions/donations";
import {
  updateFinanceAction,
  updatePostsAction,
  updateProjectsAction,
  updateSettingsAction,
  updateVideosAction,
} from "@/app/actions/site-content";
import { isDatabaseConfigured } from "@/lib/db/config";
import { getEmptySiteContentBundle } from "@/lib/site-content/defaults";
import type {
  AdminUser,
  Donation,
  FinanceDetails,
  Photo,
  Post,
  Project,
  SiteContentBundle,
  SiteSettings,
  Video,
} from "@/lib/site-content/types";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import {
  getInitialAdmins,
  getInitialDonations,
  getInitialPhotos,
} from "@/site/lib/store-defaults";

export type {
  AdminUser,
  Donation,
  FinanceDetails,
  Photo,
  Post,
  Project,
  SiteSettings,
  Video,
} from "@/lib/site-content/types";

type StoreInitialData = SiteContentBundle & {
  donations: Donation[];
};

type StoreCtx = {
  posts: Post[];
  photos: Photo[];
  projects: Project[];
  videos: Video[];
  donations: Donation[];
  admins: AdminUser[];
  settings: SiteSettings;
  finance: FinanceDetails;
  addPost: (p: Omit<Post, "id">) => Promise<void>;
  updatePost: (id: string, p: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addPhoto: (p: Omit<Photo, "id">) => void;
  updatePhoto: (id: string, p: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addVideo: (v: Omit<Video, "id">) => void;
  updateVideo: (id: string, v: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
  updateFinance: (f: FinanceDetails) => Promise<void>;
  addDonation: (d: Omit<Donation, "id">) => void;
  updateDonation: (id: string, d: Partial<Donation>) => void;
  deleteDonation: (id: string) => void;
  addAdmin: (a: Omit<AdminUser, "id">) => void;
  updateAdmin: (id: string, a: Partial<AdminUser>) => void;
  deleteAdmin: (id: string) => void;
};

const StoreContext = createContext<StoreCtx>({} as StoreCtx);

function load<T>(key: string, fallback: T): T {
  if (!isDemoContentEnabled() || isDatabaseConfigured()) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  if (!isDemoContentEnabled() || isDatabaseConfigured()) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export function SiteStoreProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: StoreInitialData;
}) {
  const fallback = getEmptySiteContentBundle();
  const seed = initialData ?? fallback;

  const [posts, setPosts] = useState<Post[]>(() =>
    isDatabaseConfigured() ? seed.posts : load("obom_posts", seed.posts)
  );
  const [photos, setPhotos] = useState<Photo[]>(() =>
    isDatabaseConfigured() ? getInitialPhotos() : load("obom_photos", getInitialPhotos())
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    isDatabaseConfigured() ? seed.projects : load("obom_projects", seed.projects)
  );
  const [videos, setVideos] = useState<Video[]>(() =>
    isDatabaseConfigured() ? seed.videos : load("obom_videos", seed.videos)
  );
  const [donations, setDonations] = useState<Donation[]>(() =>
    isDatabaseConfigured() ? (initialData?.donations ?? []) : load("obom_donations", getInitialDonations())
  );
  const [admins, setAdmins] = useState<AdminUser[]>(() => load("obom_admins", getInitialAdmins()));
  const [settings, setSettings] = useState<SiteSettings>(() =>
    isDatabaseConfigured() ? seed.settings : load("obom_settings", seed.settings)
  );
  const [finance, setFinance] = useState<FinanceDetails>(() => seed.finance);

  const persistPosts = useCallback(async (next: Post[]) => {
    if (isDatabaseConfigured()) {
      return updatePostsAction(next);
    }
    save("obom_posts", next);
    return next;
  }, []);

  const persistProjects = useCallback(async (next: Project[]) => {
    if (isDatabaseConfigured()) {
      await updateProjectsAction(next);
    } else {
      save("obom_projects", next);
    }
  }, []);

  const persistVideos = useCallback(async (next: Video[]) => {
    if (isDatabaseConfigured()) {
      await updateVideosAction(next);
    } else {
      save("obom_videos", next);
    }
  }, []);

  const addPost = useCallback(
    async (p: Omit<Post, "id">) => {
      let saved: Post[] = [];
      setPosts((prev) => {
        saved = [{ ...p, id: uid() }, ...prev];
        return saved;
      });
      const result = await persistPosts(saved);
      setPosts(result);
    },
    [persistPosts]
  );

  const updatePost = useCallback(
    async (id: string, p: Partial<Post>) => {
      let saved: Post[] = [];
      setPosts((prev) => {
        saved = prev.map((x) => (x.id === id ? { ...x, ...p } : x));
        return saved;
      });
      const result = await persistPosts(saved);
      setPosts(result);
    },
    [persistPosts]
  );

  const deletePost = useCallback(
    async (id: string) => {
      let saved: Post[] = [];
      setPosts((prev) => {
        saved = prev.filter((x) => x.id !== id);
        return saved;
      });
      const result = await persistPosts(saved);
      setPosts(result);
    },
    [persistPosts]
  );

  const addPhoto = useCallback((p: Omit<Photo, "id">) => {
    setPhotos((prev) => {
      const next = [{ ...p, id: uid() }, ...prev];
      save("obom_photos", next);
      return next;
    });
  }, []);

  const updatePhoto = useCallback((id: string, p: Partial<Photo>) => {
    setPhotos((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...p } : x));
      save("obom_photos", next);
      return next;
    });
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((x) => x.id !== id);
      save("obom_photos", next);
      return next;
    });
  }, []);

  const addProject = useCallback(
    async (p: Omit<Project, "id">) => {
      const next = [{ ...p, id: uid() }, ...projects];
      setProjects(next);
      await persistProjects(next);
    },
    [projects, persistProjects]
  );

  const updateProject = useCallback(
    async (id: string, p: Partial<Project>) => {
      const next = projects.map((x) => (x.id === id ? { ...x, ...p } : x));
      setProjects(next);
      await persistProjects(next);
    },
    [projects, persistProjects]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const next = projects.filter((x) => x.id !== id);
      setProjects(next);
      await persistProjects(next);
    },
    [projects, persistProjects]
  );

  const addVideo = useCallback(
    async (v: Omit<Video, "id">) => {
      const next = [{ ...v, id: uid() }, ...videos];
      setVideos(next);
      await persistVideos(next);
    },
    [videos, persistVideos]
  );

  const updateVideo = useCallback(
    async (id: string, v: Partial<Video>) => {
      const next = videos.map((x) => (x.id === id ? { ...x, ...v } : x));
      setVideos(next);
      await persistVideos(next);
    },
    [videos, persistVideos]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      const next = videos.filter((x) => x.id !== id);
      setVideos(next);
      await persistVideos(next);
    },
    [videos, persistVideos]
  );

  const updateSettings = useCallback(async (s: Partial<SiteSettings>) => {
    const next = { ...settings, ...s };
    setSettings(next);
    if (isDatabaseConfigured()) {
      await updateSettingsAction(next);
    } else {
      save("obom_settings", next);
    }
  }, [settings]);

  const updateFinance = useCallback(async (f: FinanceDetails) => {
    setFinance(f);
    if (isDatabaseConfigured()) {
      await updateFinanceAction(f);
    }
  }, []);

  const addDonation = useCallback((d: Omit<Donation, "id">) => {
    if (isDatabaseConfigured()) {
      void createDonationAction(d).then((row) => {
        setDonations((prev) => [row, ...prev]);
      });
      return;
    }
    setDonations((prev) => {
      const next = [{ ...d, id: uid() }, ...prev];
      save("obom_donations", next);
      return next;
    });
  }, []);

  const updateDonation = useCallback((id: string, d: Partial<Donation>) => {
    if (isDatabaseConfigured()) {
      void updateDonationAction(id, d).then((row) => {
        setDonations((prev) => prev.map((x) => (x.id === id ? row : x)));
      });
      return;
    }
    setDonations((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...d } : x));
      save("obom_donations", next);
      return next;
    });
  }, []);

  const deleteDonation = useCallback((id: string) => {
    if (isDatabaseConfigured()) {
      void deleteDonationAction(id).then(() => {
        setDonations((prev) => prev.filter((x) => x.id !== id));
      });
      return;
    }
    setDonations((prev) => {
      const next = prev.filter((x) => x.id !== id);
      save("obom_donations", next);
      return next;
    });
  }, []);

  const addAdmin = useCallback((a: Omit<AdminUser, "id">) => {
    setAdmins((prev) => {
      const next = [...prev, { ...a, id: uid() }];
      save("obom_admins", next);
      return next;
    });
  }, []);

  const updateAdmin = useCallback((id: string, a: Partial<AdminUser>) => {
    setAdmins((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...a } : x));
      save("obom_admins", next);
      return next;
    });
  }, []);

  const deleteAdmin = useCallback((id: string) => {
    setAdmins((prev) => {
      const next = prev.filter((x) => x.id !== id);
      save("obom_admins", next);
      return next;
    });
  }, []);

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
        finance,
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
        updateFinance,
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
