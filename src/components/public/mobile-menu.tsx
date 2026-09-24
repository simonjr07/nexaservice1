"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menuRef.current?.removeAttribute("open");

  return (
    <details key={pathname} ref={menuRef} className="group relative md:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span>Menu</span>
        <span aria-hidden="true" className="text-lg leading-none group-open:hidden">☰</span>
        <span aria-hidden="true" className="hidden text-lg leading-none group-open:inline">×</span>
      </summary>
      <nav aria-label="Mobile navigation" className="absolute right-0 top-full mt-3 flex w-64 flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-xl shadow-deep/10">
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper hover:text-sea">
            {link.label}
          </Link>
        ))}
        <Link href="/contact#request-quote" onClick={closeMenu} className="mt-2 rounded-lg bg-deep px-3 py-3 text-center text-sm font-semibold text-white hover:bg-sea">
          Request a quote ↗
        </Link>
      </nav>
    </details>
  );
}
