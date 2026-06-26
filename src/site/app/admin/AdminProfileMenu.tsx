"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, LayoutDashboard, LogOut, Settings, UserCircle } from "lucide-react";

import {
  ADMIN_ROLE_LABELS,
  getAdminDisplayName,
  getAdminInitials,
  getAdminRole,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User } from "@supabase/supabase-js";

type AdminProfileMenuProps = {
  onLogout: () => void;
};

export default function AdminProfileMenu({ onLogout }: AdminProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      return;
    }

    void createClient()
      .auth.getUser()
      .then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const name = getAdminDisplayName(user);
  const initials = getAdminInitials(user);
  const role = getAdminRole(user);
  const roleLabel = role ? ADMIN_ROLE_LABELS[role] : "Staff";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "#6E9277" }}
        >
          {initials}
        </div>
        <div className="hidden sm:block text-left max-w-[140px]">
          <p className="text-xs font-semibold text-foreground truncate">{name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{roleLabel}</p>
        </div>
        <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-muted bg-card shadow-xl z-50 overflow-hidden"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-muted">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? "Signed in"}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6E9277] mt-1">{roleLabel}</p>
          </div>

          <div className="py-1">
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              role="menuitem"
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              role="menuitem"
            >
              <Settings size={15} />
              Site Settings
            </Link>
            <Link
              href="/admin/accept-invite"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              role="menuitem"
            >
              <UserCircle size={15} />
              Account / Password
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              role="menuitem"
            >
              <Globe size={15} />
              View Website
            </a>
          </div>

          <div className="border-t border-muted py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
