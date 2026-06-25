"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { useColors } from "../../lib/themeStore";
import { Search, ArrowRight, Calendar, Tag } from "lucide-react";
import { useSiteMedia } from "@/site/lib/mediaContext";
import { usePublishedPosts, useSiteContent } from "@/site/lib/siteContentContext";
import NewsletterSubscribeForm from "../components/shared/NewsletterSubscribeForm";
import PageHero from "../components/shared/PageHero";
import { WaveDivider } from "../components/shared/SvgDecorators";
import { SECTION_PY } from "../../lib/pageLayout";

const CATEGORIES = ["All", "Education", "Discipleship", "Entrepreneurship", "Community", "Updates"];

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#6E9277",
  Discipleship: "#5A4749",
  Entrepreneurship: "#EAC79A",
  Community: "#6E9277",
  Updates: "#474747",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function StoriesPage() {
  const c = useColors();
  const { localImages } = useSiteMedia();
  const published = usePublishedPosts();
  const STORIES = published.map((post, index) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    date: post.date,
    category: post.category,
    img: post.img,
    author: post.author,
    featured: index === 0,
  }));
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = STORIES.find((s) => s.featured);
  const rest = STORIES.filter((s) => !s.featured);

  const filtered = rest.filter((s) => {
    const matchesCat = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const recentPosts = STORIES.slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      <PageHero
        imageSrc={localImages.storyHero}
        imageAlt="Ministry stories"
        eyebrow="From the Field"
        title="Stories & Updates"
        bottomColor={c.white}
        variant="cinematic"
      />

      {/* Featured Story */}
      {featured && (
        <section className="relative overflow-hidden" style={{ backgroundColor: c.white }}>
          <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
              <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: "#6E9277" }}>Featured Story</p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-8 rounded-2xl overflow-hidden"
              style={{ backgroundColor: c.cream }}
            >
              <div className="h-64 lg:h-auto overflow-hidden">
                <img src={featured.img} alt={featured.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 lg:py-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
                    {featured.category}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: c.muted }}>
                    <Calendar size={11} /> {featured.date}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl mb-4 leading-tight" style={{ color: c.text }}>{featured.title}</h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: c.muted }}>{featured.excerpt}</p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: c.muted }}>{featured.body}</p>
                <p className="text-xs" style={{ color: c.muted }}>By {featured.author}</p>
              </div>
            </motion.div>
          </div>
          <WaveDivider topColor={c.white} bottomColor={c.cream} />
        </section>
      )}

      {/* Stories Grid + Sidebar */}
      <section className="relative overflow-hidden" style={{ backgroundColor: c.cream }}>
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 ${SECTION_PY}`}>
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.muted }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stories..."
                    className="w-full pl-9 pr-4 py-2.5 rounded border text-sm placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]"
                    style={{ color: c.text, backgroundColor: c.white, borderColor: "rgba(110,146,119,0.3)" }}
                  />
                </div>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200"
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

              {/* Story Cards */}
              <div className="space-y-6 lg:space-y-8">
                {filtered.map((story, i) => (
                  <motion.article
                    key={story.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow group"
                    style={{ backgroundColor: c.white }}
                  >
                    <div className="sm:w-48 lg:w-56 flex-shrink-0 h-48 sm:h-auto overflow-hidden" style={{ backgroundColor: c.borderLight }}>
                      <img
                        src={story.img}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded font-semibold"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[story.category] || "#6E9277"}20`,
                              color: CATEGORY_COLORS[story.category] || "#6E9277",
                            }}
                          >
                            {story.category}
                          </span>
                          <span className="text-xs" style={{ color: c.muted }}>{story.date}</span>
                        </div>
                        <h3 className="text-base mb-2 leading-snug group-hover:text-[#6E9277] transition-colors" style={{ color: c.text }}>
                          {story.title}
                        </h3>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: c.muted }}>{story.excerpt}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs" style={{ color: c.muted }}>By {story.author}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6E9277" }}>
                          Read <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-sm" style={{ color: c.muted }}>
                    No stories found. Try a different search or category.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Recent Posts */}
              <div className="rounded-xl p-6" style={{ backgroundColor: c.white }}>
                <h4 className="text-sm mb-5 flex items-center gap-2" style={{ color: c.text }}>
                  <Calendar size={14} style={{ color: "#6E9277" }} /> Recent Posts
                </h4>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex gap-3 group cursor-pointer">
                      <img src={post.img} alt={post.title} className="w-14 h-14 rounded object-cover flex-shrink-0" />
                      <div>
                        <p className="text-xs group-hover:text-[#6E9277] transition-colors leading-snug" style={{ color: c.text }}>{post.title}</p>
                        <p className="text-xs mt-1" style={{ color: c.muted }}>{post.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-xl p-6" style={{ backgroundColor: c.white }}>
                <h4 className="text-sm mb-5 flex items-center gap-2" style={{ color: c.text }}>
                  <Tag size={14} style={{ color: "#6E9277" }} /> Categories
                </h4>
                <div className="space-y-2">
                  {CATEGORIES.filter(c => c !== "All").map((cat) => {
                    const count = STORIES.filter(s => s.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center justify-between w-full py-1.5 text-sm hover:text-[#6E9277] transition-colors"
                        style={{ color: c.muted }}
                      >
                        <span>{cat}</span>
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: c.cream, color: "#6E9277" }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter */}
              <div className="rounded-xl p-6" style={{ backgroundColor: "#6E9277" }}>
                <h4 className="text-white text-sm mb-2">Get Stories in Your Inbox</h4>
                <p className="text-white/70 text-xs mb-4">Subscribe for monthly field updates and prayer requests.</p>
                <NewsletterSubscribeForm
                  inputClassName="px-3 py-2 rounded text-xs bg-white/15 border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                  buttonClassName="py-2 rounded text-xs font-semibold text-[#474747] bg-[#EAC79A]"
                />
              </div>
            </aside>
          </div>
        </div>
        <WaveDivider topColor={c.cream} bottomColor={c.footer} />
      </section>
    </div>
  );
}
