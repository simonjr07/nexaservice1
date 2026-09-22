import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore NexaService's planned workspace care, property maintenance, and project support services.",
};

const services = [
  { number: "01", title: "Workspace care", copy: "Practical support for shared spaces and everyday environments. We focus on the details that help a place feel ready for the people who rely on it.", points: ["Everyday upkeep", "A clear point of contact", "Support shaped to the space"] },
  { number: "02", title: "Property maintenance", copy: "A considered approach to the ongoing work that keeps a property in good order. From identifying a need to planning the next step, clarity comes first.", points: ["Planned attention", "Straightforward coordination", "Careful follow-through"] },
  { number: "03", title: "Project support", copy: "Extra structure for practical projects. We help turn an initial brief into an organized path forward, with attention to scope and communication.", points: ["Scope conversations", "Practical planning", "Progress communication"] },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-deep px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Our services</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">The right kind of support for what comes next.</h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/70">Whether you are caring for a space or planning a project, the first step is understanding what matters to you. These service areas are a starting point for that conversation.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12" aria-label="Service areas">
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.number} className="flex flex-col rounded-3xl border border-line bg-white p-8">
              <span className="text-xs font-semibold tracking-[0.2em] text-sea">{service.number} / SERVICE AREA</span>
              <h2 className="mt-12 text-2xl font-semibold tracking-[-0.04em]">{service.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{service.copy}</p>
              <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-ink">
                {service.points.map((point) => <li key={point} className="flex gap-3"><span aria-hidden="true" className="text-sea">↗</span>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-6 rounded-3xl bg-[#eaf0e8] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-[-0.04em]">Not sure where your need fits?</h2><p className="mt-2 text-sm leading-7 text-muted">Start with a conversation about your space or project.</p></div>
          <Link href="/contact#request-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white hover:bg-sea">Request a quote ↗</Link>
        </div>
      </section>
    </>
  );
}
