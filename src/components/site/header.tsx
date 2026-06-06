import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-plum/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
          <span className="grid size-12 place-items-center rounded-full bg-sage font-display text-xl text-white shadow-soft">
            1x1
          </span>
          <span>
            <span className="block font-display text-2xl tracking-wide text-plum">{siteConfig.name}</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-charcoal/70">
              {siteConfig.shortName}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-charcoal">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:bg-white hover:text-sage focus:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
