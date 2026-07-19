"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { X, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { useMediaUrl, useSiteMedia } from "@/site/lib/mediaContext";
import { useSiteContent } from "@/site/lib/siteContentContext";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";
import { SectionEditor } from "../components/admin-edit/SectionEditor";
import { InlineProjectsEditor } from "../components/admin-edit/InlineProjectsEditor";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProjectsPage() {
  const c = useColors();
  const { websiteUseImages } = useSiteMedia();
  const bannerSrc = useMediaUrl(websiteUseImages.projects);
  const { projects: allProjects } = useSiteContent();
  // Archived projects stay in the DB but are hidden on the public site.
  const PROJECTS = useMemo(
    () => allProjects.filter((p) => p.status !== "Archived"),
    [allProjects]
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<(typeof PROJECTS)[number] | null>(null);

  const categories = useMemo(() => {
    const used = Array.from(new Set(PROJECTS.map((p) => p.category).filter(Boolean)));
    return used.length > 1 ? ["All", ...used] : [];
  }, [PROJECTS]);

  const filtered = activeCategory === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="overflow-x-hidden">
      <SectionEditor
        title="Projects page banner"
        fields={[
          {
            kind: "image",
            path: ["websiteUseImages", "projects"],
            label: "Top photo on Projects page",
            help: "This is only the banner. Project cards are edited with the Edit projects button below.",
          },
        ]}
      >
        <PageHero
          imageSrc={bannerSrc}
          imageAlt="Projects in the DRC"
          eyebrow="On the Ground"
          title="Our Projects"
          bottomColor={c.cream}
          variant="cinematic"
        />
      </SectionEditor>

      {/* Filter + Grid */}
      <InlineProjectsEditor title="Projects">
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
          {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat ? "#6E9277" : c.white,
                  color: activeCategory === cat ? "#ffffff" : c.text,
                  border: activeCategory === cat ? "none" : `1px solid ${c.borderLight}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="text-center text-sm py-16" style={{ color: c.muted }}>
              Projects will appear here once they are added. Admins can click Edit projects to add one with a photo upload.
            </p>
          ) : null}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  style={{ backgroundColor: c.white }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative h-52 overflow-hidden" style={{ backgroundColor: c.borderLight }}>
                    <img
                      src={project.img}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="text-white text-xs px-2.5 py-1 rounded font-semibold" style={{ backgroundColor: "#6E9277" }}>
                        {project.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-xs">
                      {project.status === "Active"
                        ? <Clock size={11} style={{ color: "#6E9277" }} />
                        : <CheckCircle2 size={11} style={{ color: "#5A4749" }} />
                      }
                      <span style={{ color: project.status === "Active" ? "#6E9277" : "#5A4749" }}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 lg:p-7">
                    <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: c.muted }}>
                      <span>{project.location}</span>
                      <span>·</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="text-base mb-2 leading-snug" style={{ color: c.text }}>{project.title}</h3>
                    <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: c.muted }}>{project.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: c.cream, color: "#6E9277" }}>
                        Impact: {project.impact}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6E9277" }}>
                        Learn More <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.footer} />
      </section>
      </InlineProjectsEditor>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: c.white }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img src={selectedProject.img} alt={selectedProject.title} className="w-full h-full object-cover rounded-t-2xl" />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X size={16} style={{ color: c.text }} />
                </button>
                <span className="absolute bottom-4 left-4 text-white text-xs px-2.5 py-1 rounded font-semibold" style={{ backgroundColor: "#6E9277" }}>
                  {selectedProject.category}
                </span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: c.muted }}>
                  <span>{selectedProject.location}</span>
                  <span>·</span>
                  <span>{selectedProject.year}</span>
                  <span>·</span>
                  <span className="font-semibold" style={{ color: "#6E9277" }}>Impact: {selectedProject.impact}</span>
                </div>
                <h2 className="text-2xl mb-4" style={{ color: c.text }}>{selectedProject.title}</h2>
                <p className="leading-relaxed mb-6" style={{ color: c.muted }}>{selectedProject.fullDesc}</p>
                <a
                  href="/donate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: "#6E9277" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a7d64")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6E9277")}
                >
                  Support This Project <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
