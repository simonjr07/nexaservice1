import Link from "next/link";
import { requireStaff } from "@/server/auth/authorization";

const modules = [
  { href: "/admin/leads", number: "01", title: "Leads", description: "Review enquiries, update their status, add private notes, and manage assignments.", adminOnly: false },
  { href: "/admin/services", number: "02", title: "Services", description: "Create, edit, and publish the service information shown on the public website.", adminOnly: true },
  { href: "/admin/testimonials", number: "03", title: "Testimonials", description: "Create, edit, and publish fictional portfolio testimonials.", adminOnly: true },
  { href: "/admin/users", number: "04", title: "Users", description: "A future administrator-only area for managing staff access.", adminOnly: true },
  { href: "/admin/settings", number: "05", title: "Settings", description: "Manage the public business name and contact details.", adminOnly: true },
];

export default async function AdminPage() {
  const user = await requireStaff();
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Overview</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Workspace overview</h1></div>
        <span className="w-fit rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-muted">Initial application shell</span>
      </div>
      <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-deep p-8 text-white sm:p-10" aria-labelledby="preview-heading">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/15" />
        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent">Staff workspace</span>
          <h2 id="preview-heading" className="mt-6 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">A calmer way to run the work behind the scenes.</h2>
          <p className="mt-5 text-sm leading-7 text-white/70">The lead inbox shows real enquiries, and administrators can manage public services, sample testimonials, and business details. Staff account management remains planned.</p>
        </div>
      </section>
      <section className="mt-12" aria-labelledby="modules-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><h2 id="modules-heading" className="text-2xl font-semibold tracking-[-0.04em]">Workspace areas</h2><p className="text-sm text-muted">Lead and content tools are available; Users is planned.</p></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.filter((module) => !module.adminOnly || user.role === "ADMIN").map((module) => (
            <Link key={module.href} href={module.href} className="group flex min-h-56 flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-sea/40">
              <div className="flex items-start justify-between"><span className="text-xs font-semibold tracking-[0.15em] text-sea">{module.number} / {module.title === "Users" ? "PLANNED" : "AVAILABLE"}</span><span aria-hidden="true" className="text-lg text-sea transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span></div>
              <div className="mt-auto"><h3 className="text-xl font-semibold">{module.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{module.description}</p></div>
            </Link>
          ))}
        </div>
      </section>
      <p className="mt-10 rounded-xl border border-[#d7e4d2] bg-[#eaf0e8] p-5 text-sm leading-7 text-ink"><strong>Security boundary:</strong> Staff authentication protects this workspace. Lead reads and changes also check authorization on the server.</p>
    </>
  );
}
