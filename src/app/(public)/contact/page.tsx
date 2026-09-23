import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { leadIntakeRepository } from "@/server/db/repositories/lead-intake";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell NexaService about your project or space and request a quote.",
};

export default async function ContactPage() {
  await connection();
  const services = await leadIntakeRepository.listPublishedServices().catch(() => []);

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20 lg:px-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">Get in touch</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">Every good project starts with a conversation.</h1>
        <p className="mt-7 max-w-xl text-lg leading-9 text-muted">Tell us about the space you care for or the work you have in mind. A clear conversation helps shape the right next step.</p>
        <Link href="/services" className="mt-8 inline-flex rounded-sm text-sm font-semibold text-sea hover:underline">Explore service areas ↗</Link>
        <div className="mt-12 hidden h-px w-20 bg-sea/30 lg:block" aria-hidden="true" />
        <p className="mt-6 max-w-sm text-sm leading-7 text-muted lg:block">Share the essentials here. You can select a service, or leave it open while we learn more about your needs.</p>
      </div>
      <div id="request-quote" className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-line bg-white shadow-sm shadow-deep/5">
        <div className="bg-deep px-7 py-8 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Request a quote</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Tell us what you need.</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">A few details will help us start the conversation.</p>
        </div>
        <div className="p-7 sm:p-10"><EnquiryForm services={services} /></div>
      </div>
    </section>
  );
}
