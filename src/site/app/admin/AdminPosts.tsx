"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save } from "lucide-react";
import { useSiteStore, Post } from "@/site/lib/siteStore";

type PostForm = Omit<Post, "id">;

const CATEGORIES = ["Education", "Discipleship", "Entrepreneurship", "Community", "Updates"];

function PostModal({ post, onSave, onClose }: { post?: Post; onSave: (p: PostForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<PostForm>(post ?? {
    title: "", excerpt: "", body: "", category: "Education", author: "", date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), img: "", published: false,
  });

  const set = (k: keyof PostForm, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e3d9ce]">
          <h3 className="text-lg text-[#474747]">{post ? "Edit Post" : "New Blog Post"}</h3>
          <button onClick={onClose} className="text-[#7a7068] hover:text-[#474747]"><X size={18} /></button>
        </div>
        <div className="p-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} placeholder="Short summary..." className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277] resize-none" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Body Content</label>
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={6} placeholder="Full article content..." className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277] resize-none" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#474747] mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277] bg-white" style={{ borderColor: "rgba(110,146,119,0.3)" }}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#474747] mb-1.5">Author</label>
              <input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Author name" className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Cover Image URL</label>
            <input value={form.img} onChange={(e) => set("img", e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          {form.img && <img src={form.img} alt="Preview" className="w-full h-36 object-cover rounded-xl" />}
          <div>
            <label className="block text-xs font-semibold text-[#474747] mb-1.5">Date</label>
            <input value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#474747] focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => set("published", !form.published)}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: form.published ? "#6E9277" : "#7a7068" }}>
              {form.published ? <Eye size={15} /> : <EyeOff size={15} />}
              {form.published ? "Published" : "Draft"}
            </button>
          </div>
        </div>
        <div className="px-7 py-4 border-t border-[#e3d9ce] flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm text-[#474747] border border-[#e3d9ce] hover:bg-[#EFE7DB] transition-colors">Cancel</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2" style={{ backgroundColor: "#6E9277" }}>
            <Save size={14} /> Save Post
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPosts() {
  const { posts, addPost, updatePost, deletePost } = useSiteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | undefined>();
  const [search, setSearch] = useState("");

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-[#474747]">Blog Posts</h1>
          <p className="text-sm text-[#7a7068]">{posts.length} posts · {posts.filter(p => p.published).length} published</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditing(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#6E9277" }}>
          <Plus size={15} /> New Post
        </motion.button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="w-full max-w-xs px-3 py-2 rounded-xl border text-sm text-[#474747] placeholder-[#a09890] focus:outline-none focus:border-[#6E9277]" style={{ borderColor: "rgba(110,146,119,0.3)" }} />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[#e3d9ce] flex items-center gap-4 px-5 py-4 hover:shadow-sm transition-shadow">
              <img src={post.img} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-[#e3d9ce]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#474747] truncate">{post.title}</p>
                <p className="text-xs text-[#7a7068] truncate mt-0.5">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#6E9277" + "18", color: "#6E9277" }}>{post.category}</span>
                  <span className="text-xs text-[#7a7068]">by {post.author} · {post.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updatePost(post.id, { published: !post.published })}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{ backgroundColor: post.published ? "#6E9277" + "15" : "#e3d9ce", color: post.published ? "#6E9277" : "#7a7068" }}>
                  {post.published ? "Live" : "Draft"}
                </button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditing(post); setShowModal(true); }}
                  className="p-2 rounded-lg hover:bg-[#EFE7DB] transition-colors text-[#7a7068]"><Pencil size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => { if (confirm("Delete this post?")) deletePost(post.id); }}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400"><Trash2 size={14} /></motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-center py-12 text-[#7a7068] text-sm">No posts found.</div>}
      </div>

      <AnimatePresence>
        {showModal && (
          <PostModal
            post={editing}
            onSave={(f) => editing ? updatePost(editing.id, f) : addPost(f)}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
