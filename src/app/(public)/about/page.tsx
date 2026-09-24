import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicSettings } from "@/features/website-content/manage-content";
import workplaceImage from "@/assets/workplace-interior.webp";
import { publicOpenGraph } from "@/lib/public-social-image";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the fictional NexaService concept for practical commercial workplace and facility support.",
  openGraph: {
    ...publicOpenGraph,
    title: "About NexaService",
    description: "Meet the fictional NexaService concept for practical commercial workplace and facility support.",
  },
};

export default async function AboutPage() {
  const { businessName } = await getPublicSettings();
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14 lg:px-12" aria-labelledby="about-heading">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">About {businessName}</p>
          <div aria-hidden="true" className="mt-8 h-1 w-16 bg-sea" />
          <h1 id="about-heading" className="mt-10 text-5xl font-semibold leading-[1.08] tracking-[-0.06em] sm:text-6xl lg:text-5xl xl:text-6xl">Service should feel considered, not complicated.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-muted">{businessName} is a fictional commercial workplace services company. The concept focuses on helping businesses coordinate upkeep, facility support, and the practical work that keeps a place ready for everyday use.</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">The approach starts by understanding the site and the request, then agreeing on a clear plan for the work ahead.</p>
        </div>
        <figure className="min-w-0">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-deep">
            <Image src={workplaceImage} alt="Illustrative view of an empty, modern commercial workplace with glass meeting rooms" sizes="(max-width: 1023px) 100vw, (max-width: 1280px) 42vw, 520px" className="h-72 w-full object-cover sm:h-[28rem] lg:h-[38rem] xl:h-[35rem]" />
          </div>
          <figcaption className="mt-3 text-xs leading-5 text-muted">Illustrative image for this fictional portfolio concept; it does not depict a NexaService location.</figcaption>
        </figure>
      </section>
      <section className="bg-[#eaf0e8] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.055em]">What guides the work</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Understand the site", "Learn what the workplace needs before choosing a sensible service response."],
              ["Keep it clear", "Make scope, next steps, and communication easy to follow."],
              ["Care for the details", "Give routine tasks and one-off requests the attention they need."],
            ].map(([title, copy]) => <article key={title} className="rounded-3xl bg-white p-8"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-4 text-sm leading-7 text-muted">{copy}</p></article>)}
          </div>
          <Link href="/services" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white hover:bg-sea">Explore our services ↗</Link>
        </div>
      </section>
    </>
  );
}
