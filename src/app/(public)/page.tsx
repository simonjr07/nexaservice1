import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Workspace care",
    description: "Keep everyday spaces ready for the people who use them, with thoughtful ongoing support.",
    detail: "Everyday spaces",
  },
  {
    number: "02",
    title: "Property maintenance",
    description: "Make upkeep easier to plan, coordinate, and follow through from first request to final check.",
    detail: "Places that last",
  },
  {
    number: "03",
    title: "Project support",
    description: "Bring structure and a reliable point of contact to the practical work behind a new project.",
    detail: "Plans in motion",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-deep text-white">
        <div aria-hidden="true" className="absolute -right-48 -top-48 h-96 w-96 rounded-full border border-white/10" />
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:py-32">
          <div className="relative z-10">
            <p className="mb-7 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Service, made simpler
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
              Good work starts with <span className="text-accent">better care.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              From the spaces you use every day to the projects you are ready to move forward, NexaService brings clear communication and practical support to the work that matters.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact#request-quote" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-deep transition-colors hover:bg-white">
                Request a quote <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/services" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10">
                Explore services
              </Link>
            </div>
            <p className="mt-12 border-l border-accent/60 pl-4 text-sm text-white/55">
              Thoughtful help. Clear next steps. Work you can feel good about.
            </p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-8 rounded-full bg-sea/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#1d4149] p-5 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/15 pb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                <span>NexaService approach</span>
                <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" /><i className="h-2 w-2 rounded-full bg-white/20" /><i className="h-2 w-2 rounded-full bg-white/20" /></span>
              </div>
              <div className="relative mt-8 rounded-[1.5rem] bg-paper p-6 text-ink sm:p-8">
                <div className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-2xl">↗</div>
                <div className="mb-12 h-14 w-14 rounded-2xl bg-deep p-3.5">
                  <div className="h-full w-full rounded-md border-2 border-accent" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">A better service experience</p>
                <p className="mt-3 max-w-xs text-3xl font-semibold leading-tight tracking-[-0.05em]">The right support, from first conversation to follow-through.</p>
                <div className="mt-8 grid grid-cols-3 gap-2 border-t border-line pt-5 text-xs font-semibold text-muted sm:gap-4">
                  <span>01 / Listen</span><span>02 / Plan</span><span>03 / Deliver</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/55">
                <span>Made for the details that matter</span><span className="text-accent">● &nbsp; Thoughtful by design</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12" aria-labelledby="services-heading">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">What we do</p>
            <h2 id="services-heading" className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Support built around real needs.</h2>
          </div>
          <Link href="/services" className="w-fit rounded-sm text-sm font-semibold text-sea hover:underline">View all services <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.number} className="group flex min-h-80 flex-col rounded-3xl border border-line bg-white p-7 transition-colors hover:border-sea/35 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-sea">{service.number} / SERVICE</span>
                <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-paper text-xl text-sea transition-colors group-hover:bg-accent">↗</span>
              </div>
              <div className="mt-auto">
                <p className="text-xs font-medium text-muted">{service.detail}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#eaf0e8] py-20 md:py-28" aria-labelledby="why-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">Why NexaService</p>
            <h2 id="why-heading" className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">A more considered way to get things done.</h2>
            <p className="mt-6 max-w-md text-base leading-8 text-muted">Good service should feel straightforward. We put care into the details, keep the conversation clear, and make room for the work to be done well.</p>
          </div>
          <div className="divide-y divide-ink/15 border-t border-ink/15">
            {[
              ["01", "Clear from the start", "Understand the need, agree on the next step, and keep communication easy to follow."],
              ["02", "Attention to the details", "Approach each space and project with care rather than a one-size-fits-all checklist."],
              ["03", "Built on follow-through", "Keep the work moving with a practical process and a clear point of contact."],
            ].map(([number, title, description]) => (
              <div key={number} className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr]">
                <span className="pt-1 text-xs font-semibold text-sea">{number}</span>
                <div><h3 className="text-xl font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28 lg:px-12" aria-labelledby="process-heading">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">How it works</p>
          <h2 id="process-heading" className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Simple steps. Better outcomes.</h2>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["01", "Tell us what you need", "Share the space, project, or challenge you would like help with."],
            ["02", "Shape a practical plan", "We clarify the scope and agree on a sensible way forward."],
            ["03", "Move forward with care", "The work gets the attention and follow-through it deserves."],
          ].map(([number, title, description]) => (
            <li key={number} className="border-t-2 border-sea pt-6">
              <span className="text-sm font-semibold text-sea">{number}</span>
              <h3 className="mt-9 text-xl font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-muted">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-sea px-8 py-12 text-white sm:px-12 md:flex-row md:items-center md:py-16">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Ready when you are</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Let’s make the next step easier.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/75">Explore how NexaService could support your space or project.</p></div>
          <Link href="/contact#request-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-5 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-deep hover:bg-white">Request a quote <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
