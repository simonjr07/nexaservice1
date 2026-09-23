import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { serviceRepository } from "@/server/db/repositories/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore the published services offered by NexaService and start a conversation about your needs.",
};

export default async function ServicesPage() {
  await connection();
  const services = await serviceRepository.listPublished();
  return <>
    <section className="bg-deep px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Our services</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">The right kind of support for what comes next.</h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/70">Explore how NexaService can support your space or project. Each service begins with a conversation about what you need.</p>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12" aria-label="Available services">
      {services.length === 0 ? <div className="rounded-3xl border border-line bg-white p-10"><h2 className="text-2xl font-semibold">Services are being prepared</h2><p className="mt-3 text-sm leading-7 text-muted">There are no published service details yet. You can still tell us what you need.</p><Link href="/contact#request-quote" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea">Request a quote ↗</Link></div> :
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => <article key={service.id} className="flex flex-col rounded-3xl border border-line bg-white p-8">
          <span className="text-xs font-semibold tracking-[0.2em] text-sea">{String(index + 1).padStart(2, "0")} / SERVICE</span>
          <h2 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">{service.name}</h2>
          <p className="mt-4 flex-1 text-sm leading-7 text-muted">{service.shortDescription}</p>
          <Link href={`/services/${service.slug}`} className="mt-8 inline-flex min-h-11 items-center border-t border-line pt-5 text-sm font-semibold text-sea hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea">Explore service ↗</Link>
        </article>)}</div>}
      <div className="mt-12 flex flex-col gap-6 rounded-3xl bg-[#eaf0e8] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div><h2 className="text-2xl font-semibold tracking-[-0.04em]">Not sure where your need fits?</h2><p className="mt-2 text-sm leading-7 text-muted">Start with a conversation about your space or project.</p></div>
        <Link href="/contact#request-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white hover:bg-sea">Request a quote ↗</Link>
      </div>
    </section>
  </>;
}
