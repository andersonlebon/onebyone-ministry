import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { projects } from "@/lib/site";

export const metadata = createMetadata({
  title: "Projects",
  description: "Explore ministry projects, outreach focus areas, and future impact reporting for One By One Ministries.",
  path: "/projects"
});

export default function ProjectsPage() {
  return (
    <>
      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Projects"
            title="Organized around outreach, discipleship, and one-by-one care."
            description="Each project card is ready for real descriptions, impact stories, goals, galleries, and giving or volunteer calls to action."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {projects.map((project, index) => (
              <article key={project.slug} className="flex min-h-full flex-col rounded-[2rem] bg-white p-7 shadow-soft">
                <span className="grid size-12 place-items-center rounded-full bg-gold font-display text-xl text-plum">
                  0{index + 1}
                </span>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-sage">{project.focus}</p>
                <h2 className="mt-4 font-display text-3xl text-plum">{project.title}</h2>
                <p className="mt-4 leading-7 text-charcoal/75">{project.summary}</p>
                <ul className="mt-6 grid gap-3 text-sm text-charcoal/75">
                  {project.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3">
                      <span className="mt-2 size-2 rounded-full bg-sage" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
