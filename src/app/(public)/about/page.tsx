import type { Metadata } from "next";
import Link from "next/link";
import { getPublicSettings } from "@/features/website-content/manage-content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the considered approach behind this fictional professional service company.",
};

export default async function AboutPage() {
  const { businessName } = await getPublicSettings();
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">About {businessName}</p><div aria-hidden="true" className="mt-8 h-1 w-16 bg-sea" /></div>
        <div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.06em] sm:text-6xl">Service should feel considered, not complicated.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">{businessName} is a fictional service company built around a simple idea: people deserve clear communication and practical care when they ask for help with a space or project.</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">Our approach begins with listening, continues with a sensible plan, and stays focused on the details that make work easier to understand and manage.</p>
        </div>
      </section>
      <section className="bg-[#eaf0e8] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.055em]">What guides the work</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Listen first", "Understand the situation before deciding what support makes sense."],
              ["Keep it clear", "Make scope, next steps, and communication easy to follow."],
              ["Care for the details", "Treat the practical pieces as part of the whole experience."],
            ].map(([title, copy]) => <article key={title} className="rounded-3xl bg-white p-8"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-4 text-sm leading-7 text-muted">{copy}</p></article>)}
          </div>
          <Link href="/services" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white hover:bg-sea">Explore our services ↗</Link>
        </div>
      </section>
    </>
  );
}
