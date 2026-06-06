import Link from "next/link";

import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { impactStats, projects, siteConfig, testimonials } from "@/lib/site";

export const metadata = createMetadata({
  description:
    "Discover One By One Ministries, a professional ministry website built for storytelling, outreach, prayer, giving, and community impact."
});

export default function HomePage() {
  return (
    <>
      <section className="px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.32em] text-sage">Faith in action</p>
            <h1 className="mt-5 font-display text-5xl leading-none text-plum sm:text-6xl lg:text-7xl">
              Serving people one life at a time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{siteConfig.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-involved"
                className="inline-flex items-center justify-center rounded-full bg-sage px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-plum"
              >
                Get involved
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full border border-sage/30 bg-white px-6 py-3 text-sm font-bold text-sage transition hover:-translate-y-0.5 hover:border-plum hover:text-plum"
              >
                View projects
              </Link>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] bg-plum p-6 text-white shadow-soft">
            <div className="absolute -left-5 -top-5 hidden rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink shadow-soft sm:block">
              Future-ready launch
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-7 backdrop-blur">
              <p className="font-display text-4xl">Ministry storytelling that moves people to action.</p>
              <p className="mt-5 leading-8 text-cream/85">
                This site foundation is built to share mission, vision, outreach updates, photo and video stories,
                testimonies, and clear contact paths for partners and volunteers.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {impactStats.map((stat) => (
                  <div key={stat.value} className="rounded-3xl bg-cream/10 p-4">
                    <p className="font-display text-3xl text-gold">{stat.value}</p>
                    <p className="mt-2 text-xs leading-5 text-cream/80">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Core ministry paths"
            title="A clear structure for visitors, partners, and the people you serve."
            description="The roadmap pages are organized around credibility, storytelling, connection, and conversion-ready next steps."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.slug} className="rounded-[2rem] border border-charcoal/10 bg-cream/50 p-6 transition hover:-translate-y-1 hover:shadow-soft">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-sage">{project.focus}</p>
                <h2 className="mt-4 font-display text-3xl text-plum">{project.title}</h2>
                <p className="mt-4 leading-7 text-charcoal/75">{project.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Stories"
            title="Prepared for testimonies with care, consent, and clarity."
            description="The content model gives OBOM room to publish authentic impact stories as the ministry gathers approved photos, videos, and quotes."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.person} className="rounded-[2rem] bg-white p-7 shadow-soft">
                <p className="text-lg leading-8 text-charcoal/80">&quot;{testimonial.quote}&quot;</p>
                <footer className="mt-5 text-sm font-bold text-plum">
                  {testimonial.person} <span className="font-normal text-charcoal/60">- {testimonial.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
