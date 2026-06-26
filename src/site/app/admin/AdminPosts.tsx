"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { useSiteStore, Post } from "@/site/lib/siteStore";
import { slugifyPostTitle } from "@/lib/site-content/posts";

type PostForm = Omit<Post, "id">;

const CATEGORIES = ["Education", "Discipleship", "Entrepreneurship", "Community", "Updates"];

function PostModal({
  post,
  saving,
  onSave,
  onClose,
}: {
  post?: Post;
  saving: boolean;
  onSave: (p: PostForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PostForm>(
    post ?? {
      title: "",
      excerpt: "",
      body: "",
      category: "Education",
      author: "",
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      img: "",
      published: false,
      slug: "",
    }
  );

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-muted">
          <h3 className="text-lg text-foreground">{post ? "Edit Post" : "New Blog Post"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="p-7 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: f.slug?.trim() ? f.slug : slugifyPostTitle(title),
                }));
              }}
              placeholder="Post title"
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">URL slug</label>
            <input
              value={form.slug ?? ""}
              onChange={(e) => set("slug", slugifyPostTitle(e.target.value))}
              placeholder="how-one-school-changed-a-village"
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Public link: /stories/{form.slug || "your-slug"}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="Short summary..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277] resize-none"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Body Content</label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={8}
              placeholder="Full article content..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277] resize-none"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277] bg-card"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Author</label>
              <input
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Author name"
                className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
                style={{ borderColor: "rgba(110,146,119,0.3)" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Cover Image URL</label>
            <input
              value={form.img}
              onChange={(e) => set("img", e.target.value)}
              placeholder="https://... or /assets/..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          {form.img ? <img src={form.img} alt="Preview" className="w-full h-36 object-cover rounded-xl" /> : null}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Date</label>
            <input
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground focus:outline-none focus:border-[#6E9277]"
              style={{ borderColor: "rgba(110,146,119,0.3)" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("published", !form.published)}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: form.published ? "#6E9277" : "#7a7068" }}
            >
              {form.published ? <Eye size={15} /> : <EyeOff size={15} />}
              {form.published ? "Published" : "Draft"}
            </button>
          </div>
        </div>
        <div className="px-7 py-4 border-t border-muted flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm text-foreground border border-muted hover:bg-muted transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.03 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            disabled={saving || !form.title.trim() || !form.body.trim()}
            onClick={async () => {
              try {
                await onSave(form);
                onClose();
              } catch {
                /* parent shows error */
              }
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: "#6E9277" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Post"}
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (form: PostForm) => {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updatePost(editing.id, form);
        setMessage("Post updated and synced to the website.");
      } else {
        await addPost(form);
        setMessage("Post created and synced to the website.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    setError("");
    try {
      await deletePost(id);
      setMessage("Post deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete post.");
    }
  };

  const handleTogglePublished = async (post: Post) => {
    setError("");
    try {
      await updatePost(post.id, { published: !post.published });
      setMessage(post.published ? "Post moved to draft." : "Post published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update post.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} posts · {posts.filter((p) => p.published).length} published · saved to database
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#6E9277" }}
        >
          <Plus size={15} /> New Post
        </motion.button>
      </div>

      {message ? (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-[#eef5f0] text-[#3d5f48] border border-[#cfe0d3]">{message}</div>
      ) : null}
      {error ? (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      ) : null}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full max-w-xs px-3 py-2 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#6E9277]"
          style={{ borderColor: "rgba(110,146,119,0.3)" }}
        />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl border border-muted flex items-center gap-4 px-5 py-4 hover:shadow-sm transition-shadow"
            >
              <img src={post.img} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: "#6E927718", color: "#6E9277" }}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {post.author} · {post.date}
                  </span>
                  {post.published && post.slug ? (
                    <a
                      href={`/stories/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6E9277] hover:underline"
                    >
                      View live
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => void handleTogglePublished(post)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: post.published ? "#6E927715" : "#e3d9ce",
                    color: post.published ? "#6E9277" : "#7a7068",
                  }}
                >
                  {post.published ? "Live" : "Draft"}
                </button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setEditing(post);
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Pencil size={14} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => void handleDelete(post.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">No posts found.</div> : null}
      </div>

      <AnimatePresence>
        {showModal ? (
          <PostModal
            post={editing}
            saving={saving}
            onSave={handleSave}
            onClose={() => setShowModal(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
