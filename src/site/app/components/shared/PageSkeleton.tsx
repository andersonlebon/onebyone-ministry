"use client";

import { useColors } from "@/site/lib/themeStore";

/** Lightweight page placeholder while public routes load. */
export default function PageSkeleton() {
  const c = useColors();

  return (
    <div className="min-h-[70vh] animate-pulse" aria-hidden>
      <div className="h-72 sm:h-96 w-full" style={{ backgroundColor: c.heroBg }} />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 space-y-6">
        <div className="h-3 w-28 rounded" style={{ backgroundColor: c.borderLight }} />
        <div className="h-8 max-w-md rounded w-[66%]" style={{ backgroundColor: c.borderLight }} />
        <div className="h-4 w-full max-w-2xl rounded" style={{ backgroundColor: c.borderLight }} />
        <div className="h-4 max-w-xl rounded w-[83%]" style={{ backgroundColor: c.borderLight }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
              <div className="h-40" style={{ backgroundColor: c.cream }} />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 rounded" style={{ backgroundColor: c.borderLight }} />
                <div className="h-4 w-[75%] rounded" style={{ backgroundColor: c.borderLight }} />
                <div className="h-3 w-full rounded" style={{ backgroundColor: c.borderLight }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
