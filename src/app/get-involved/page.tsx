import Link from "next/link";

import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { involvementOptions } from "@/lib/site";

export const metadata = createMetadata({
  title: "Get Involved",
  description: "Find clear next steps to pray, serve, give, and partner with One By One Ministries.",
  path: "/get-involved"
});

export default function GetInvolvedPage() {
  return (
    <section className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get involved"
          title="Invite supporters into meaningful next steps."
          description="This page is designed to convert ministry interest into prayer support, volunteer conversations, giving inquiries, and partnership opportunities."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {involvementOptions.map((option) => (
            <article key={option.title} className="rounded-[2rem] bg-white p-7 shadow-soft">
              <h2 className="font-display text-4xl text-plum">{option.title}</h2>
              <p className="mt-5 leading-7 text-charcoal/75">{option.description}</p>
              <Link
                href="/contact"
                className="mt-7 inline-flex rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:bg-plum"
              >
                {option.action}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] bg-plum p-8 text-cream shadow-soft">
          <h2 className="font-display text-4xl text-white">Launch recommendation</h2>
          <p className="mt-4 max-w-3xl leading-8 text-cream/80">
            Before accepting online donations, connect a trusted giving platform, publish clear financial language, and
            confirm nonprofit compliance requirements for the ministry location.
          </p>
        </div>
      </div>
    </section>
  );
}
