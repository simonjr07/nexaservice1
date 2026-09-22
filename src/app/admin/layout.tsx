import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = {
  title: "Dashboard preview",
  description: "A visual preview of the future NexaService operations dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2f5f2] text-ink lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to dashboard content</a>
      <aside className="hidden min-h-screen bg-deep px-5 py-7 text-white lg:flex lg:flex-col">
        <div className="px-3"><Brand inverse /><p className="mt-3 pl-12 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Operations preview</p></div>
        <div className="mt-14 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Workspace</div>
        <div className="mt-4"><DashboardNav /></div>
        <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4">
          <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">Preview only</span>
          <p className="mt-3 text-xs leading-6 text-white/60">Operational features will be added after authentication and authorization.</p>
          <Link href="/" className="mt-4 inline-block text-xs font-semibold text-accent hover:underline">View public site ↗</Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-line bg-white px-5 py-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden lg:block"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">NexaService workspace</p><p className="mt-1 text-sm text-muted">Visual dashboard shell</p></div>
            <Link href="/" className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-sea hover:text-sea lg:hidden">Public site ↗</Link>
            <span className="hidden rounded-full bg-[#eaf0e8] px-4 py-2 text-xs font-semibold text-sea sm:inline-flex">Preview mode · No live data</span>
          </div>
        </header>
        <div className="bg-deep px-4 py-2 lg:hidden"><DashboardNav mobile /></div>
        <main id="dashboard-main" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
