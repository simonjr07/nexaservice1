import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find out how to start a conversation with NexaService. The enquiry experience is coming soon.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20 lg:px-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">Get in touch</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">Every good project starts with a conversation.</h1>
        <p className="mt-7 max-w-xl text-lg leading-9 text-muted">Tell us about the space you care for or the work you have in mind. A clear conversation helps shape the right next step.</p>
        <Link href="/services" className="mt-8 inline-flex rounded-sm text-sm font-semibold text-sea hover:underline">Explore service areas ↗</Link>
      </div>
      <div id="request-quote" className="scroll-mt-28 rounded-[2rem] bg-deep p-8 text-white sm:p-12">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-xl text-deep">↗</span>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.25em] text-accent">Request a quote</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">Enquiries are opening soon.</h2>
        <p className="mt-5 text-sm leading-7 text-white/70">This is an early website preview. The contact and quote form has not been launched, so no request can be submitted yet.</p>
        <div className="mt-10 border-t border-white/20 pt-5 text-xs text-white/50">No details are collected on this page.</div>
      </div>
    </section>
  );
}
