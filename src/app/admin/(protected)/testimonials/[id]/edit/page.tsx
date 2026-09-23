import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { getAdminTestimonial } from "@/features/website-content/manage-content";
import { requireAdmin } from "@/server/auth/authorization";
import { websiteContentRepository } from "@/server/db/repositories/website-content";
import { editTestimonialAction } from "../../actions";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  let testimonial: Awaited<ReturnType<typeof getAdminTestimonial>>;
  try {
    testimonial = await getAdminTestimonial(user, (await params).id, websiteContentRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">This testimonial could not be loaded. Please try again.</p>;
  }
  if (!testimonial) notFound();
  return <><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Testimonials / Edit</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Edit {testimonial.customerName}</h1><p className="mt-3 text-sm text-muted">{testimonial.published ? "This example is public." : "This example is a private draft."}</p><TestimonialForm action={editTestimonialAction.bind(null, testimonial.id)} testimonial={testimonial} /></>;
}
