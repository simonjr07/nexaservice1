import Link from "next/link";
import { Brand } from "@/components/brand";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm font-medium text-muted transition-colors hover:text-sea"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact#request-quote"
          className="hidden rounded-full bg-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea md:inline-flex"
        >
          Request a quote <span aria-hidden="true" className="ml-3">↗</span>
        </Link>
        <details className="group relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>Menu</span>
            <span aria-hidden="true" className="text-lg leading-none group-open:hidden">☰</span>
            <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">×</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-full mt-3 flex w-64 flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-xl shadow-deep/10"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper hover:text-sea"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact#request-quote"
              className="mt-2 rounded-lg bg-deep px-3 py-3 text-center text-sm font-semibold text-white hover:bg-sea"
            >
              Request a quote ↗
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
