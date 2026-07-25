"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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
import { useServerActionsForContent } from "@/lib/db/client-persistence";
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

/** Site content must never live in localStorage (only theme/lang/auth prefs elsewhere). */
const CONTENT_STORAGE_KEYS = [
  "obom_posts",
  "obom_photos",
  "obom_projects",
  "obom_videos",
  "obom_settings",
  "obom_donations",
] as const;

function clearStaleContentStorage() {
  if (typeof window === "undefined") return;
  try {
    for (const key of CONTENT_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

function useLocalDemoStore() {
  return isDemoContentEnabled() && !useServerActionsForContent();
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
  const persistToServer = useServerActionsForContent();
  const demoLocal = useLocalDemoStore();

  useEffect(() => {
    clearStaleContentStorage();
  }, []);

  const [posts, setPosts] = useState<Post[]>(() => seed.posts);
  const [photos, setPhotos] = useState<Photo[]>(() => getInitialPhotos());
  const [projects, setProjects] = useState<Project[]>(() => seed.projects);
  const [videos, setVideos] = useState<Video[]>(() => seed.videos);
  const [donations, setDonations] = useState<Donation[]>(() =>
    persistToServer ? (initialData?.donations ?? []) : getInitialDonations()
  );
  const [admins, setAdmins] = useState<AdminUser[]>(() => getInitialAdmins());
  const [settings, setSettings] = useState<SiteSettings>(() => seed.settings);
  const [finance, setFinance] = useState<FinanceDetails>(() => seed.finance);

  const persistPosts = useCallback(async (next: Post[]) => {
    if (persistToServer) {
      return updatePostsAction(next);
    }
    // Demo-only: keep in React memory for the session. Never write site content to localStorage.
    void demoLocal;
    return next;
  }, [persistToServer, demoLocal]);

  const persistProjects = useCallback(async (next: Project[]) => {
    if (persistToServer) {
      await updateProjectsAction(next);
    }
  }, [persistToServer]);

  const persistVideos = useCallback(async (next: Video[]) => {
    if (persistToServer) {
      await updateVideosAction(next);
    }
  }, [persistToServer]);

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
    setPhotos((prev) => [{ ...p, id: uid() }, ...prev]);
  }, []);

  const updatePhoto = useCallback((id: string, p: Partial<Photo>) => {
    setPhotos((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addProject = useCallback(
    async (p: Omit<Project, "id">) => {
      let next: Project[] = [];
      setProjects((prev) => {
        next = [{ ...p, id: uid() }, ...prev];
        return next;
      });
      await persistProjects(next);
    },
    [persistProjects]
  );

  const updateProject = useCallback(
    async (id: string, p: Partial<Project>) => {
      let next: Project[] = [];
      setProjects((prev) => {
        next = prev.map((x) => (x.id === id ? { ...x, ...p } : x));
        return next;
      });
      await persistProjects(next);
    },
    [persistProjects]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      let next: Project[] = [];
      setProjects((prev) => {
        next = prev.filter((x) => x.id !== id);
        return next;
      });
      await persistProjects(next);
    },
    [persistProjects]
  );

  const addVideo = useCallback(
    async (v: Omit<Video, "id">) => {
      let next: Video[] = [];
      setVideos((prev) => {
        next = [{ ...v, id: uid() }, ...prev];
        return next;
      });
      await persistVideos(next);
    },
    [persistVideos]
  );

  const updateVideo = useCallback(
    async (id: string, v: Partial<Video>) => {
      let next: Video[] = [];
      setVideos((prev) => {
        next = prev.map((x) => (x.id === id ? { ...x, ...v } : x));
        return next;
      });
      await persistVideos(next);
    },
    [persistVideos]
  );

  const deleteVideo = useCallback(
    async (id: string) => {
      let next: Video[] = [];
      setVideos((prev) => {
        next = prev.filter((x) => x.id !== id);
        return next;
      });
      await persistVideos(next);
    },
    [persistVideos]
  );

  const updateSettings = useCallback(async (s: Partial<SiteSettings>) => {
    let next!: SiteSettings;
    setSettings((prev) => {
      next = { ...prev, ...s };
      return next;
    });
    if (persistToServer) {
      await updateSettingsAction(next);
    }
  }, [persistToServer]);

  const updateFinance = useCallback(async (f: FinanceDetails) => {
    setFinance(f);
    if (persistToServer) {
      await updateFinanceAction(f);
    }
  }, [persistToServer]);

  const addDonation = useCallback((d: Omit<Donation, "id">) => {
    if (persistToServer) {
      void createDonationAction(d).then((row) => {
        setDonations((prev) => [row, ...prev]);
      });
      return;
    }
    setDonations((prev) => [{ ...d, id: uid() }, ...prev]);
  }, [persistToServer]);

  const updateDonation = useCallback((id: string, d: Partial<Donation>) => {
    if (persistToServer) {
      void updateDonationAction(id, d).then((row) => {
        setDonations((prev) => prev.map((x) => (x.id === id ? row : x)));
      });
      return;
    }
    setDonations((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x)));
  }, [persistToServer]);

  const deleteDonation = useCallback((id: string) => {
    if (persistToServer) {
      void deleteDonationAction(id).then(() => {
        setDonations((prev) => prev.filter((x) => x.id !== id));
      });
      return;
    }
    setDonations((prev) => prev.filter((x) => x.id !== id));
  }, [persistToServer]);

  const addAdmin = useCallback((a: Omit<AdminUser, "id">) => {
    setAdmins((prev) => [...prev, { ...a, id: uid() }]);
  }, []);

  const updateAdmin = useCallback((id: string, a: Partial<AdminUser>) => {
    setAdmins((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x)));
  }, []);

  const deleteAdmin = useCallback((id: string) => {
    setAdmins((prev) => prev.filter((x) => x.id !== id));
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
