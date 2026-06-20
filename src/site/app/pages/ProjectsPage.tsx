"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { X, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { projectImages, websiteUseImages } from "@/content/media";
import { WaveDivider } from "../components/shared/SvgDecorators";

const CATEGORIES = ["All", "Education", "Entrepreneurship", "Discipleship", "Community"];

const PROJECTS = [
  {
    id: 1,
    title: "Rural School Building Initiative",
    category: "Education",
    status: "Active",
    desc: "Constructing three new classrooms in Kinshasa's peri-urban villages to give 200+ children a safe place to learn. This project includes teacher training, curriculum development, and school supply provision.",
    img: projectImages[0],
    location: "Kinshasa Province",
    year: "2024–2025",
    impact: "200+ children",
    fullDesc: "The Rural School Building Initiative is OBOM's flagship education project. Working alongside local masons and community volunteers, we are constructing three permanent classroom buildings in villages that previously relied on makeshift shelters or open-air settings for teaching. Each classroom is equipped with desks, a chalkboard, teaching materials, and solar lighting. Alongside construction, we train community members as teachers and provide an ongoing curriculum review program.",
  },
  {
    id: 2,
    title: "Women's Entrepreneurship Cohort",
    category: "Entrepreneurship",
    status: "Active",
    desc: "A 12-week skills program empowering 30 women with business training, start-up capital, and peer accountability to launch and sustain small businesses.",
    img: projectImages[1],
    location: "Kasai Province",
    year: "2023–Ongoing",
    impact: "90+ graduates",
    fullDesc: "This intensive 12-week cohort equips women with business literacy, financial management, and practical trade skills. Each graduate receives a micro-grant to launch her enterprise, plus 6 months of post-program mentorship. We partner with local women's associations to recruit participants and ensure long-term peer support networks.",
  },
  {
    id: 3,
    title: "Village Pastoral Training Program",
    category: "Discipleship",
    status: "Active",
    desc: "Equipping 15 rural pastors per cohort with theological education, discipleship resources, and ongoing mentorship to strengthen the local church.",
    img: projectImages[2],
    location: "Multiple Provinces",
    year: "2021–Ongoing",
    impact: "45+ pastors trained",
    fullDesc: "In partnership with a network of local churches, OBOM runs quarterly intensives for pastors serving in underserved rural areas. Content covers Biblical hermeneutics, church planting, pastoral care, and community development theology. Each pastor is paired with a mentor and given a study library to take back to their church.",
  },
  {
    id: 4,
    title: "Clean Water Access Project",
    category: "Community",
    status: "Completed",
    desc: "Drilled five community wells and trained local technicians in maintenance — providing clean water access to 1,200+ community members.",
    img: projectImages[3],
    location: "Maniema Province",
    year: "2022–2023",
    impact: "1,200+ people",
    fullDesc: "Working with a local NGO partner and community health volunteers, OBOM financed and managed the drilling of five boreholes across three villages. Each well is maintained by a trained local technician and a water committee of community members. The project also included hygiene education workshops for over 300 families.",
  },
  {
    id: 5,
    title: "Youth Bible Study Network",
    category: "Discipleship",
    status: "Active",
    desc: "Weekly small groups in 8 villages led by trained youth leaders, discipling the next generation of Christian leaders in the DRC.",
    img: projectImages[4],
    location: "Kinshasa & Kasai",
    year: "2023–Ongoing",
    impact: "350+ youth",
    fullDesc: "OBOM's youth discipleship network pairs trained college students with groups of 15-20 secondary school students for weekly Bible study and mentorship. Groups meet in homes, churches, and school premises. The program includes a summer leadership camp and an annual service project.",
  },
  {
    id: 6,
    title: "Agricultural Skills Training",
    category: "Entrepreneurship",
    status: "Active",
    desc: "Teaching sustainable farming techniques to 40 farming families to improve crop yield, nutrition, and economic independence.",
    img: projectImages[5],
    location: "Kasai Province",
    year: "2024–Ongoing",
    impact: "40 families",
    fullDesc: "This program trains farmers in sustainable agriculture techniques — crop rotation, composting, drip irrigation, and seed banking — to increase food security and income. Participants receive a starter kit of seeds and tools. The project includes monthly farm visits from agronomist volunteers and tracks household nutrition outcomes.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProjectsPage() {
  const c = useColors();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

  const filtered = activeCategory === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-72 sm:h-80 flex items-center justify-center overflow-hidden" style={{ backgroundColor: c.heroBg }}>
        <img
          src={websiteUseImages.projects}
          alt="Projects in the DRC"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: c.isDark ? 0.28 : 0.40 }}
        />
        <div className="absolute inset-0" style={{ background: c.isDark ? "linear-gradient(to bottom, rgba(0,0,0,0.50), rgba(0,0,0,0.75))" : "linear-gradient(to bottom, rgba(0,0,0,0.20), rgba(0,0,0,0.50))" }} />
        <div className="relative z-10 text-center px-5">
          <p className="text-[#EAC79A] text-xs tracking-[0.2em] uppercase mb-3">On the Ground</p>
          <h1 className="text-4xl lg:text-5xl text-white">Our Projects</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <WaveDivider topColor="transparent" bottomColor={c.cream} />
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: c.cream }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2.5 mb-12">
            {CATEGORIES.map((cat) => (
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
      </section>

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
