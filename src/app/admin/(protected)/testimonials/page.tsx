import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialPublicationForm } from "@/components/dashboard/testimonial-publication-form";
import { listAdminTestimonials } from "@/features/website-content/manage-content";
import { requireAdmin } from "@/server/auth/authorization";
import { websiteContentRepository } from "@/server/db/repositories/website-content";
import { setTestimonialPublicationAction } from "./actions";

export const metadata: Metadata = { title: "Manage testimonials" };

export default async function AdminTestimonialsPage() {
  const user = await requireAdmin();
  let testimonials: Awaited<ReturnType<typeof listAdminTestimonials>>;
  try {
    testimonials = await listAdminTestimonials(user, websiteContentRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">Testimonials could not be loaded. Please try again.</p>;
  }
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Testimonials</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-semibold tracking-[-0.055em]">Testimonial management</h1><p className="mt-3 text-sm leading-6 text-muted">Manage fictional portfolio examples shown on the public homepage.</p></div><Link href="/admin/testimonials/new" className="inline-flex min-h-11 items-center rounded-full bg-deep px-5 text-sm font-semibold text-white hover:bg-sea">Create testimonial ↗</Link></div>
    {testimonials.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#c7d5cf] bg-white p-10"><h2 className="text-xl font-semibold">No testimonials yet</h2><p className="mt-2 text-sm text-muted">Create a fictional draft if you want to demonstrate this section.</p><Link href="/admin/testimonials/new" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-sea hover:underline">Create a sample testimonial ↗</Link></div> :
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white"><table className="admin-records-table w-full border-collapse text-left text-sm"><thead className="bg-[#f7f9f7] text-xs font-semibold uppercase tracking-[0.08em] text-muted"><tr><th scope="col" className="px-5 py-4">Customer</th><th scope="col" className="px-5 py-4">Company</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4">Created</th><th scope="col" className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-line">{testimonials.map((item) => <tr key={item.id} className="align-top"><th scope="row" className="px-5 py-4 font-semibold"><Link href={`/admin/testimonials/${item.id}/edit`} className="hover:text-sea hover:underline">{item.customerName}</Link></th><td data-label="Company" className="px-5 py-4 text-muted">{item.company ?? "—"}</td><td data-label="Status" className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.published ? "bg-[#eaf0e8] text-sea" : "bg-[#f0f2f0] text-muted"}`}>{item.published ? "Published" : "Draft"}</span></td><td data-label="Created" className="px-5 py-4 text-muted"><time dateTime={item.createdAt.toISOString()}>{item.createdAt.toLocaleDateString("en-GB")}</time></td><td data-label="Actions" className="px-5 py-4"><div className="flex flex-wrap items-center gap-4"><Link href={`/admin/testimonials/${item.id}/edit`} className="font-semibold text-sea hover:underline">Edit</Link><TestimonialPublicationForm published={item.published} action={setTestimonialPublicationAction.bind(null, item.id, !item.published)} /></div></td></tr>)}</tbody></table></div>}
  </>;
}
