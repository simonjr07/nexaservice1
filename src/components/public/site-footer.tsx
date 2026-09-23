import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr] lg:px-12">
        <div className="max-w-sm">
          <Brand inverse />
          <p className="mt-6 text-sm leading-7 text-white/65">
            Practical support for the places you work and the projects you care about.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <nav aria-label="Footer navigation" className="mt-5 flex flex-col gap-3 text-sm text-white/65">
            <Link className="w-fit hover:text-accent" href="/services">Services</Link>
            <Link className="w-fit hover:text-accent" href="/about">About us</Link>
            <Link className="w-fit hover:text-accent" href="/contact">Contact</Link>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Start a conversation</h2>
          <p className="mt-5 text-sm leading-7 text-white/65">
            Tell us what you need. Start with a short enquiry and we can take it from there.
          </p>
          <Link href="/contact#request-quote" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
            Request a quote <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/15 px-5 py-6 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
        <p>© {new Date().getFullYear()} NexaService. A fictional portfolio concept.</p>
        <p>Built with care for clarity and usefulness.</p>
      </div>
    </footer>
  );
}
