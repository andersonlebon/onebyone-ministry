import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-5 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-display text-7xl text-gold">404</p>
      <h1 className="mt-4 font-display text-5xl text-plum">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-charcoal/75">
        The page you are looking for may have moved. Return home to continue exploring One By One Ministries.
      </p>
      <Link className="mt-8 inline-flex rounded-full bg-sage px-6 py-3 text-sm font-bold text-white" href="/">
        Back to home
      </Link>
    </section>
  );
}
