"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText,
  Image,
  Folder,
  Video,
  Users,
  TrendingUp,
  Eye,
  Heart,
  CheckCircle2,
  Circle,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useSiteStore } from "@/site/lib/siteStore";
import { isDemoContentEnabled } from "@/lib/runtime-env";
import {
  buildDashboardReadiness,
  readinessSummary,
  type ReadinessItem,
} from "@/site/lib/dashboard-readiness";
import { useReadinessEnv } from "@/site/lib/readinessEnvContext";
import AdminContentGuide from "@/site/app/admin/AdminContentGuide";

const statCard = (label: string, value: number | string, icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>, color: string, sub: string) => ({
  label, value, icon, color, sub,
});

function PriorityBadge({ priority }: { priority: ReadinessItem["priority"] }) {
  const styles = {
    critical: "bg-red-500/10 text-red-600",
    important: "bg-amber-500/10 text-amber-700",
    optional: "bg-muted text-muted-foreground",
  };
  const labels = { critical: "Before launch", important: "Content", optional: "Optional" };
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}

function ReadinessRow({ item, index }: { item: ReadinessItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className="flex items-start gap-3 px-5 py-4 border-b border-muted last:border-0 hover:bg-muted/40"
    >
      {item.done ? (
        <CheckCircle2 size={18} className="text-[#6E9277] flex-shrink-0 mt-0.5" />
      ) : (
        <Circle size={18} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <PriorityBadge priority={item.priority} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
      </div>
      {!item.done && (
        <Link
          href={item.href}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-[#6E9277] hover:underline"
        >
          Fix <ArrowRight size={12} />
        </Link>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { posts, photos, projects, videos, settings, finance } = useSiteStore();
  const paymentEnv = useReadinessEnv();

  const readiness = buildDashboardReadiness({
    settings,
    posts,
    projects,
    videoCount: videos.length,
    finance,
    paymentEnv,
  });
  const summary = readinessSummary(readiness);
  const criticalOpen = readiness.filter((i) => i.priority === "critical" && !i.done);
  const importantOpen = readiness.filter((i) => i.priority === "important" && !i.done);

  const stats = [
    statCard("Blog Posts", posts.length, FileText, "#6E9277", `${posts.filter(p => p.published).length} published`),
    statCard("Photos", photos.length, Image, "#EAC79A", "In library"),
    statCard("Projects", projects.length, Folder, "#5A4749", `${projects.filter(p => p.status === "Active").length} active`),
    statCard("Videos", videos.length, Video, "#474747", "In library"),
    ...(isDemoContentEnabled()
      ? [
          statCard("Communities", "18+", Users, "#6E9277", "Served"),
          statCard("Families Reached", "500+", Heart, "#5A4749", "Since 2015"),
        ]
      : []),
  ];

  const recentActivity = isDemoContentEnabled()
    ? [
        { type: "post", label: "New blog post published", sub: "How One School Changed a Village", time: "2h ago", color: "#6E9277" },
        { type: "photo", label: "5 photos added to library", sub: "Community category", time: "5h ago", color: "#EAC79A" },
        { type: "project", label: "Project status updated", sub: "Rural School Building Initiative → Active", time: "1d ago", color: "#5A4749" },
        { type: "video", label: "New video added", sub: "Year in Congo Documentary", time: "2d ago", color: "#474747" },
      ]
    : [];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Use the guide below to edit the public website, then track launch items when you are ready.
        </p>
      </div>

      <AdminContentGuide />

      {/* Launch readiness */}
      <div className="bg-card rounded-2xl border border-muted overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#6E9277]/15">
              <ClipboardList size={18} className="text-[#6E9277]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Launch checklist</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optional setup reminders · {summary.done} of {summary.total} complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${summary.total ? Math.round((summary.done / summary.total) * 100) : 0}%`,
                  backgroundColor: "#6E9277",
                }}
              />
            </div>
            <span className="text-sm font-semibold text-[#6E9277]">
              {summary.total ? Math.round((summary.done / summary.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {(criticalOpen.length > 0 || importantOpen.length > 0) && (
          <div className="px-6 py-3 bg-amber-500/5 border-b border-muted">
            <p className="text-xs text-foreground">
              {criticalOpen.length > 0 && (
                <span>
                  <strong>{criticalOpen.length} critical</strong>
                  {importantOpen.length > 0 ? ", " : " still open. "}
                </span>
              )}
              {importantOpen.length > 0 && (
                <span>
                  <strong>{importantOpen.length} content</strong> items to review.
                </span>
              )}
              {criticalOpen.length === 0 && importantOpen.length > 0 && " Review content items when you have time."}
            </p>
          </div>
        )}

        <div className="max-h-[420px] overflow-y-auto">
          {readiness.map((item, i) => (
            <ReadinessRow key={item.id} item={item} index={i} />
          ))}
        </div>

        <div className="px-6 py-4 border-t border-muted bg-muted/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            These are reminders, not blockers. Click <strong className="text-foreground">Fix</strong> to open the right admin page.
            Public giving supports Card (Stripe), Venmo, and Bank Transfer.
          </p>
        </div>
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
        <div className="bg-card rounded-2xl border border-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-muted flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Blog Posts</h3>
            <Eye size={14} style={{ color: "#7a7068" }} />
          </div>
          <div className="divide-y divide-muted">
            {posts.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground">No blog posts yet.</p>
            ) : (
              posts.slice(0, 4).map((post, i) => (
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
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-muted">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-muted">
            {recentActivity.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted-foreground">Activity will appear here as you manage content.</p>
            ) : (
              recentActivity.map((item, i) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {isDemoContentEnabled() && (
        <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: "#6E9277" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Development demo login</p>
              <p className="text-white/70 text-xs mt-0.5">Email: admin@obom.org · Password: Admin2025!</p>
            </div>
            <div className="text-white/50 text-xs">Local only — not shown in production</div>
          </div>
        </div>
      )}
    </div>
  );
}
