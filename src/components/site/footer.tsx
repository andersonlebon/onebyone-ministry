import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-plum text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-3xl text-white">{siteConfig.name}</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-cream/80">{siteConfig.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Explore</h2>
          <ul className="mt-4 grid gap-2 text-sm text-cream/80">
            {siteConfig.navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Connect</h2>
          <address className="mt-4 not-italic text-sm leading-7 text-cream/80">
            <a className="transition hover:text-white" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
            <br />
            <span>{siteConfig.location}</span>
          </address>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {siteConfig.socialLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-cream/80 transition hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/60">
        Copyright {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
