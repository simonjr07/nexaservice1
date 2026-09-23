import type { Metadata } from "next";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { requireAdmin } from "@/server/auth/authorization";
import { createTestimonialAction } from "../actions";

export const metadata: Metadata = { title: "Create testimonial" };

export default async function NewTestimonialPage() {
  await requireAdmin();
  return <><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Testimonials / New</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Create a testimonial</h1><p className="mt-3 text-sm text-muted">New testimonials remain private unless you publish them.</p><TestimonialForm action={createTestimonialAction} /></>;
}
