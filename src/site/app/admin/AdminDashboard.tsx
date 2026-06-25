"use client";

import { motion } from "motion/react";
import { FileText, Image, Folder, Video, Users, TrendingUp, Eye, Heart } from "lucide-react";
import { useSiteStore } from "@/site/lib/siteStore";

const statCard = (label: string, value: number | string, icon: any, color: string, sub: string) => ({
  label, value, icon, color, sub,
});

export default function AdminDashboard() {
  const { posts, photos, projects, videos } = useSiteStore();

  const stats = [
    statCard("Blog Posts", posts.length, FileText, "#6E9277", `${posts.filter(p => p.published).length} published`),
    statCard("Photos", photos.length, Image, "#EAC79A", "In library"),
    statCard("Projects", projects.length, Folder, "#5A4749", `${projects.filter(p => p.status === "Active").length} active`),
    statCard("Videos", videos.length, Video, "#474747", "In library"),
    statCard("Communities", "18+", Users, "#6E9277", "Served"),
    statCard("Families Reached", "500+", Heart, "#5A4749", "Since 2015"),
  ];

  const recentActivity = [
    { type: "post", label: "New blog post published", sub: "How One School Changed a Village", time: "2h ago", color: "#6E9277" },
    { type: "photo", label: "5 photos added to library", sub: "Community category", time: "5h ago", color: "#EAC79A" },
    { type: "project", label: "Project status updated", sub: "Rural School Building Initiative → Active", time: "1d ago", color: "#5A4749" },
    { type: "video", label: "New video added", sub: "Year in Congo Documentary", time: "2d ago", color: "#474747" },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening at OBOM.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(71,71,71,0.1)" }}
              className="bg-card rounded-2xl p-5 border border-muted cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "18" }}>
                  <Icon size={17} style={{ color: s.color }} />
                </div>
                <TrendingUp size={14} style={{ color: "#6E9277" }} />
              </div>
              <p className="text-2xl text-foreground mb-0.5" style={{ fontFamily: "'Francois One', sans-serif" }}>{s.value}</p>
              <p className="text-sm text-foreground font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Posts + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="bg-card rounded-2xl border border-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-muted flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Blog Posts</h3>
            <Eye size={14} style={{ color: "#7a7068" }} />
          </div>
          <div className="divide-y divide-muted">
            {posts.slice(0, 4).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-3 px-6 py-3.5"
              >
                <img src={post.img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.date} · {post.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${post.published ? "text-[#6E9277] bg-[#6E9277]/10" : "text-muted-foreground bg-muted"}`}>
                  {post.published ? "Live" : "Draft"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card rounded-2xl border border-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-muted">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-muted">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3 px-6 py-3.5"
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <span className="text-xs text-muted-foreground/70 flex-shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick info */}
      <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: "#6E9277" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Admin Credentials (Demo)</p>
            <p className="text-white/70 text-xs mt-0.5">Email: admin@obom.org · Password: Admin2025!</p>
          </div>
          <div className="text-white/50 text-xs">Connect Supabase for real auth</div>
        </div>
      </div>
    </div>
  );
}
