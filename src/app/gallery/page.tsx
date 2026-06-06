import Image from "next/image";

import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { galleryItems } from "@/lib/site";

export const metadata = createMetadata({
  title: "Gallery",
  description: "Browse future-ready photo stories, video highlights, and testimony media for One By One Ministries.",
  path: "/gallery"
});

export default function GalleryPage() {
  return (
    <section className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Gallery"
          title="A media-ready gallery for photos, videos, and impact stories."
          description="Placeholder visuals are included now; real ministry assets can replace them in the public image library and content data."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {galleryItems.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <div className="relative aspect-[16/10] bg-cream">
                <Image src={item.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-sage">{item.category}</p>
                <h2 className="mt-3 font-display text-3xl text-plum">{item.title}</h2>
                <p className="mt-4 leading-7 text-charcoal/75">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
