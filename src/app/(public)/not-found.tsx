import Link from "next/link";

export default function PublicNotFound() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <div className="max-w-2xl rounded-3xl border border-line bg-white p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Page not found</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">We could not find that page.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">The service may no longer be published, or the address may have changed.</p>
        <Link href="/services" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea">Browse services ↗</Link>
      </div>
    </section>
  );
}
