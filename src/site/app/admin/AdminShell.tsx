"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Folder,
  Video,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Globe,
  Bell,
  DollarSign,
  BarChart2,
  Users,
  Landmark,
} from "lucide-react";

import { brandAssets } from "@/content/media";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { id: "posts", label: "Blog Posts", icon: FileText, href: "/admin/posts" },
  { id: "photos", label: "Photo Library", icon: ImageIcon, href: "/admin/photos" },
  { id: "projects", label: "Projects", icon: Folder, href: "/admin/projects" },
  { id: "videos", label: "Videos", icon: Video, href: "/admin/videos" },
  { id: "donations", label: "Donations", icon: DollarSign, href: "/admin/donations" },
  { id: "finance", label: "Finance Details", icon: Landmark, href: "/admin/finance" },
  { id: "analytics", label: "Analytics", icon: BarChart2, href: "/admin/analytics" },
  { id: "admins", label: "Admin Users", icon: Users, href: "/admin/admins" },
  { id: "settings", label: "Site Settings", icon: Settings, href: "/admin/settings" },
] as const;

interface AdminShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href)) ?? NAV_ITEMS[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image
            src={brandAssets.logoWhite}
            alt="OBOM"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
          />
          {sidebarOpen && (
            <div>
              <p className="text-white text-xs font-semibold leading-tight">Admin Portal</p>
              <p className="text-white/40 text-xs">One By One Ministries</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.id} href={item.href} onClick={() => setMobileSidebarOpen(false)}>
              <motion.span
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all ${active ? "text-white" : "text-white/55 hover:text-white/90 hover:bg-white/8"}`}
                style={active ? { backgroundColor: "rgba(255,255,255,0.15)" } : {}}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={17} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm flex-1">{item.label}</span>}
                {sidebarOpen && active && <ChevronRight size={13} />}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <motion.a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/55 hover:text-white/90 hover:bg-white/8 transition-all"
          whileHover={{ x: 2 }}
        >
          <Globe size={17} />
          {sidebarOpen && <span className="text-sm">View Website</span>}
        </motion.a>
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/55 hover:text-red-400 hover:bg-white/8 transition-all"
          whileHover={{ x: 2 }}
        >
          <LogOut size={17} />
          {sidebarOpen && <span className="text-sm">Sign Out</span>}
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f0ea] overflow-hidden">
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 68 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: "#474747" }}
      >
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[220px] lg:hidden flex flex-col"
              style={{ backgroundColor: "#474747" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#e3d9ce] px-5 h-14 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileSidebarOpen(!mobileSidebarOpen);
              }}
              className="p-1.5 rounded-lg hover:bg-[#EFE7DB] transition-colors text-[#474747]"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-[#474747]">{activeItem.label}</h2>
              <p className="text-xs text-[#7a7068]">One By One Ministries Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-[#EFE7DB] transition-colors text-[#7a7068] relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#6E9277]" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: "#6E9277" }}
            >
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
