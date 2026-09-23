import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireStaff } from "@/server/auth/authorization";

export const metadata: Metadata = {
  title: "Staff workspace",
  description: "The NexaService staff workspace.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <div className="min-h-screen bg-[#f2f5f2] text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to dashboard content</a>
      <aside className="hidden min-h-screen bg-deep px-5 py-7 text-white lg:flex lg:flex-col">
        <div className="px-3"><Brand inverse /><p className="mt-3 pl-12 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Staff workspace</p></div>
        <div className="mt-14 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Workspace</div>
        <div className="mt-4"><DashboardNav role={user.role} /></div>
        <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4">
          <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">Lead inbox available</span>
          <p className="mt-3 text-xs leading-6 text-white/60">Work with enquiries in Leads. Other workspace areas are planned.</p>
          <Link href="/" className="mt-4 inline-block text-xs font-semibold text-accent hover:underline">View public site ↗</Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-line bg-white px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden lg:block"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">NexaService workspace</p><p className="mt-1 text-sm text-muted">Staff lead management</p></div>
            <div className="flex items-center gap-3">
              <span className="hidden text-right text-xs text-muted sm:block"><strong className="block text-sm text-ink">{user.name || user.email}</strong>{user.role}</span>
              <LogoutButton />
            </div>
          </div>
        </header>
        <div className="bg-deep px-4 py-2 lg:hidden"><DashboardNav mobile role={user.role} /></div>
        <main id="dashboard-main" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
