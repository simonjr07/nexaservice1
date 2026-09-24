import Link from "next/link";
import { Brand } from "@/components/brand";
import { MobileMenu } from "@/components/public/mobile-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ businessName }: { businessName: string }) {
  return (
    <header className="relative z-20 border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12">
        <Brand businessName={businessName} />
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
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
