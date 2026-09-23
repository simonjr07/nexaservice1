import Link from "next/link";
import type { Role } from "@/generated/prisma/client";

const items = [
  { href: "/admin", label: "Overview", mark: "◫", adminOnly: false },
  { href: "/admin/leads", label: "Leads", mark: "◎", adminOnly: false },
  { href: "/admin/services", label: "Services", mark: "◇", adminOnly: true },
  { href: "/admin/testimonials", label: "Testimonials", mark: "❝", adminOnly: true },
  { href: "/admin/users", label: "Users", mark: "♧", adminOnly: true },
  { href: "/admin/settings", label: "Settings", mark: "⚙", adminOnly: true },
];

export function DashboardNav({ mobile = false, role }: { mobile?: boolean; role: Role }) {
  return (
    <nav aria-label="Dashboard navigation" className={mobile ? "grid grid-cols-3 gap-1" : "space-y-1"}>
      {items.filter((item) => !item.adminOnly || role === "ADMIN").map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center rounded-xl font-medium transition-colors hover:bg-white/10 hover:text-white ${mobile ? "min-w-0 flex-col gap-1 px-1 py-2 text-center text-[11px] text-white/75" : "gap-3 px-4 py-3 text-sm text-white/60"}`}
        >
          <span aria-hidden="true" className="w-5 text-center text-lg leading-none text-accent">{item.mark}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
