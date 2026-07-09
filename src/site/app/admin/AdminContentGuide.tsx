import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Folder,
  Globe,
  Image as ImageIcon,
  Landmark,
  Settings,
  Video,
} from "lucide-react";

const GUIDE_ITEMS = [
  {
    href: "/admin/settings",
    icon: Settings,
    title: "Site Settings",
    edits: "Homepage headline, mission text, contact info, social links, hero images and logos",
    showsOn: "Home page, footer, Contact page",
    color: "#6E9277",
  },
  {
    href: "/admin/posts",
    icon: FileText,
    title: "Blog Posts",
    edits: "Stories and field updates (title, text, photo, publish or draft)",
    showsOn: "Stories page (/stories)",
    color: "#6E9277",
  },
  {
    href: "/admin/projects",
    icon: Folder,
    title: "Projects",
    edits: "Ministry projects, descriptions, status, and photos",
    showsOn: "Projects page (/projects)",
    color: "#5A4749",
  },
  {
    href: "/admin/photos",
    icon: ImageIcon,
    title: "Photo Library",
    edits: "Upload and manage gallery photos",
    showsOn: "Photos page (/photos)",
    color: "#EAC79A",
  },
  {
    href: "/admin/videos",
    icon: Video,
    title: "Videos",
    edits: "YouTube video links, titles, and thumbnails",
    showsOn: "Videos page (/videos)",
    color: "#474747",
  },
  {
    href: "/admin/finance",
    icon: Landmark,
    title: "Finance Details",
    edits: "Donate page info: Venmo, Zelle, bank, check, crypto, etc.",
    showsOn: "Donate page (/donate)",
    color: "#6E9277",
  },
] as const;

export default function AdminContentGuide() {
  return (
    <div className="bg-card rounded-2xl border border-muted overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-muted bg-[#6E9277]/5">
        <h2 className="text-base font-semibold text-foreground">How to edit the website</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Use the menu on the left. Open a section, make your changes, then click <strong className="text-foreground">Save</strong>.
          Updates appear on the public site right away.
        </p>
      </div>

      <div className="px-6 py-4 border-b border-muted">
        <ol className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <li className="rounded-xl bg-muted/40 px-4 py-3">
            <span className="font-semibold text-foreground">1. Pick a section</span>
            <br />
            Choose from the left menu or the cards below.
          </li>
          <li className="rounded-xl bg-muted/40 px-4 py-3">
            <span className="font-semibold text-foreground">2. Edit and save</span>
            <br />
            Change text or images, then click Save or Save Changes.
          </li>
          <li className="rounded-xl bg-muted/40 px-4 py-3">
            <span className="font-semibold text-foreground">3. Check the live site</span>
            <br />
            Open the public website to confirm your update.
          </li>
        </ol>
      </div>

      <div className="divide-y divide-muted">
        {GUIDE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <Icon size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-[#6E9277] transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  <strong className="text-foreground/80">You edit:</strong> {item.edits}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong className="text-foreground/80">Shows on:</strong> {item.showsOn}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#6E9277] flex-shrink-0 mt-1">
                Open <ArrowRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-muted flex flex-wrap items-center justify-between gap-3 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          The launch checklist below tracks setup items. Donation card payments are still being finalized on our side.
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E9277] hover:underline"
        >
          <Globe size={14} />
          View public website
        </a>
      </div>
    </div>
  );
}
