import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { brandColors } from "@/lib/site";

export const metadata = createMetadata({
  title: "About Us",
  description: "Learn about the mission, values, and growth-ready foundation of One By One Ministries.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <>
      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="About the ministry"
            title="A professional home for mission, vision, and trusted ministry presence."
            description="One By One Ministries can use this page to introduce leadership, explain the mission, and invite visitors into the heart behind the work."
          />
          <div className="prose-site rounded-[2rem] bg-white p-8 shadow-soft">
            <p>
              The site is intentionally structured for ministry storytelling: clear messaging, accessible navigation,
              mobile-friendly layouts, and room for future growth as new projects, media, and testimonies are collected.
            </p>
            <p>
              Before launch, this page should be enriched with the ministry history, leadership bios, a concise statement
              of faith or values, service area details, and high-quality photos that reflect the people and communities served.
            </p>
            <p>
              The design language follows the requested brand palette and type pairing, balancing warmth, credibility,
              and clarity for visitors who may be discovering the ministry for the first time.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Brand foundation"
            title="Colors and tone aligned for a warm ministry experience."
            description="The roadmap palette is implemented as Tailwind design tokens so future components stay consistent."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-5">
            {brandColors.map((color) => (
              <article key={color.value} className="overflow-hidden rounded-[1.5rem] border border-charcoal/10 bg-cream/40">
                <div className="h-28" style={{ backgroundColor: color.value }} />
                <div className="p-5">
                  <h2 className="font-bold text-plum">{color.name}</h2>
                  <p className="mt-1 font-mono text-xs text-charcoal/60">{color.value}</p>
                  <p className="mt-3 text-sm leading-6 text-charcoal/70">{color.usage}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
