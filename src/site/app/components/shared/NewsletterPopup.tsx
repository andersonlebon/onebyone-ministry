"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, CheckCircle2 } from "lucide-react";
import { useColors } from "../../../lib/themeStore";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

const SEEN_KEY = "obom_newsletter_seen";

export default function NewsletterPopup() {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === "true") return;
    } catch {}

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setOpen(true);
      cleanup();
    };

    const timer = window.setTimeout(reveal, 20000);
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const half = document.documentElement.scrollHeight * 0.5;
      if (scrolled >= half) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(SEEN_KEY, "true"); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await subscribeToNewsletter({ firstName, email, company });
    if (res.ok) {
      setStatus("success");
      setMessage(res.message);
      try { localStorage.setItem(SEEN_KEY, "true"); } catch {}
    } else {
      setStatus("error");
      setMessage(res.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: "rgba(13,24,16,0.55)", backdropFilter: "blur(4px)" }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: c.white }}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: c.hoverBg, color: c.muted }}
            >
              <X size={16} />
            </button>

            <div className="h-2" style={{ backgroundColor: "#6E9277" }} />

            <div className="p-8">
              {status === "success" ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "#6E9277" }}>
                    <CheckCircle2 size={26} color="white" />
                  </div>
                  <h3 className="text-xl mb-2" style={{ color: c.text }}>You're in!</h3>
                  <p className="text-sm" style={{ color: c.muted }}>{message}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={16} className="text-[#6E9277]" />
                    <p className="text-xs tracking-[0.18em] uppercase" style={{ color: "#6E9277" }}>
                      Join Our Prayer Network
                    </p>
                  </div>
                  <h3 className="text-2xl mb-2" style={{ color: c.text }}>Stay Connected</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: c.muted }}>
                    Receive monthly updates, field stories, and prayer requests from the heart of Congo.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[#6E9277]"
                      style={{ color: c.text, backgroundColor: c.inputBg, borderColor: c.border }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[#6E9277]"
                      style={{ color: c.text, backgroundColor: c.inputBg, borderColor: c.border }}
                    />
                    {/* Honeypot field — hidden from humans */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="hidden"
                      aria-hidden="true"
                    />
                    {status === "error" && (
                      <p className="text-xs" style={{ color: "#d4183d" }}>{message}</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                      style={{ backgroundColor: "#6E9277" }}
                    >
                      {status === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                    <p className="text-center text-xs" style={{ color: c.muted }}>
                      We respect your inbox. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
