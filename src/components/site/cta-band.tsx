import Link from "next/link";

export function CtaBand() {
  return (
    <section className="bg-sage px-5 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-3xl">Ready to serve one life at a time?</p>
          <p className="mt-3 max-w-2xl text-white/80">
            Connect with the ministry to share your story, volunteer, partner, or learn more about upcoming projects.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-white"
        >
          Contact the ministry
        </Link>
      </div>
    </section>
  );
}
