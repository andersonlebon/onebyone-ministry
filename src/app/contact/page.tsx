import { ContactForm } from "@/components/site/contact-form";
import { SectionHeading } from "@/components/site/section-heading";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact",
  description: "Contact One By One Ministries for prayer, volunteer opportunities, giving inquiries, and project partnerships.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <section className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Start a conversation with the ministry."
            description="Use the form to ask a question, share a story, request prayer, or begin a conversation about partnership."
          />
          <div className="mt-8 rounded-[2rem] bg-cream/70 p-6 text-charcoal/80">
            <h2 className="font-display text-3xl text-plum">Direct contact</h2>
            <p className="mt-4 leading-7">
              Email: <a className="font-bold text-sage" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
            <p className="mt-2 leading-7">{siteConfig.location}</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
