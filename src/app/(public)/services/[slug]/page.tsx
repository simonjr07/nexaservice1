import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { serviceRepository } from "@/server/db/repositories/services";

const getPublishedService = cache((slug: string) => serviceRepository.findPublished(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connection();
  const service = await getPublishedService((await params).slug);
  if (!service) notFound();
  return { title: service.name, description: service.shortDescription };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const service = await getPublishedService((await params).slug);
  if (!service) notFound();
  return <>
    <section className="bg-deep px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12"><div className="mx-auto max-w-7xl">
      <Link href="/services" className="text-sm font-semibold text-accent hover:underline">← All services</Link>
      <p className="mt-12 text-xs font-semibold uppercase tracking-[0.25em] text-accent">NexaService / Service</p>
      <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">{service.name}</h1>
      <p className="mt-7 max-w-2xl text-lg leading-9 text-white/70">{service.shortDescription}</p>
    </div></section>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-12" aria-label="Service details">
      <div><h2 className="text-2xl font-semibold tracking-[-0.04em]">How we can help</h2><p className="mt-7 whitespace-pre-wrap break-words text-base leading-9 text-muted">{service.description}</p></div>
      <aside className="h-fit rounded-3xl bg-[#eaf0e8] p-8"><h2 className="text-2xl font-semibold tracking-[-0.04em]">Tell us what you need.</h2><p className="mt-3 text-sm leading-7 text-muted">Share a few details and we can start a conversation about this service.</p><Link href={`/contact?serviceId=${service.id}#request-quote`} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea">Request a quote ↗</Link></aside>
    </section>
  </>;
}
