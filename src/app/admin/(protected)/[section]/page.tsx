import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/server/auth/authorization";

const sections: Record<string, { title: string; description: string }> = {
  testimonials: { title: "Testimonials", description: "This area is reserved for future management of approved public testimonials." },
  users: { title: "Users", description: "Staff account management is planned as an administrator-only feature." },
  settings: { title: "Settings", description: "Selected website settings will be managed here by administrators in a later task." },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const user = await requireStaff();
  const { section } = await params;
  const content = sections[section];
  if (!content) notFound();
  if (user.role !== "ADMIN") notFound();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / {content.title}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">{content.title}</h1>
      <div className="mt-10 flex min-h-96 flex-col items-start justify-center rounded-[2rem] border border-dashed border-[#c7d5cf] bg-white p-8 sm:p-12">
        <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf0e8] text-2xl text-sea">◇</div>
        <span className="mt-8 rounded-full bg-[#eaf0e8] px-3 py-1 text-xs font-semibold text-sea">Coming later</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{content.title} workspace is on the way.</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-muted">{content.description}</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">This is a protected visual placeholder. It contains no live business data or working administrative controls.</p>
        <Link href="/admin" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea">Back to overview</Link>
      </div>
    </>
  );
}
