"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TestimonialRecord } from "@/server/db/repositories/website-content";
import { initialTestimonialState, type ContentActionState, type TestimonialField } from "@/features/website-content/validation";

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20";

export function TestimonialForm({ action, testimonial }: {
  action: (state: ContentActionState<TestimonialField>, data: FormData) => Promise<ContentActionState<TestimonialField>>;
  testimonial?: TestimonialRecord;
}) {
  const [state, formAction, pending] = useActionState(action, initialTestimonialState);
  const errors = state.fieldErrors ?? {};
  return <form action={formAction} noValidate className="mt-8 max-w-3xl space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
    <div><label htmlFor="testimonial-customer" className="block text-sm font-semibold">Customer name <span aria-hidden="true" className="text-sea">*</span></label><input id="testimonial-customer" name="customerName" required minLength={2} maxLength={120} defaultValue={testimonial?.customerName ?? ""} aria-invalid={!!errors.customerName} aria-describedby={errors.customerName ? "testimonial-customer-error" : undefined} className={inputClass} />{errors.customerName && <p id="testimonial-customer-error" className="mt-2 text-sm text-red-800">{errors.customerName}</p>}</div>
    <div><label htmlFor="testimonial-company" className="block text-sm font-semibold">Company <span className="font-normal text-muted">(optional)</span></label><input id="testimonial-company" name="company" maxLength={120} defaultValue={testimonial?.company ?? ""} aria-invalid={!!errors.company} aria-describedby={errors.company ? "testimonial-company-error" : undefined} className={inputClass} />{errors.company && <p id="testimonial-company-error" className="mt-2 text-sm text-red-800">{errors.company}</p>}</div>
    <div><label htmlFor="testimonial-content" className="block text-sm font-semibold">Testimonial <span aria-hidden="true" className="text-sea">*</span></label><textarea id="testimonial-content" name="content" rows={7} required minLength={20} maxLength={2000} defaultValue={testimonial?.content ?? ""} aria-invalid={!!errors.content} aria-describedby={errors.content ? "testimonial-content-error" : undefined} className={inputClass} />{errors.content && <p id="testimonial-content-error" className="mt-2 text-sm text-red-800">{errors.content}</p>}</div>
    <label className="flex items-start gap-3 rounded-xl bg-[#f7f9f7] p-4 text-sm"><input name="published" type="checkbox" defaultChecked={testimonial?.published ?? false} className="mt-1 accent-sea" /><span><span className="font-semibold">Publish this testimonial</span><span className="mt-1 block text-muted">Published testimonials appear on the public homepage as fictional portfolio examples. New entries stay private unless selected.</span></span></label>
    <p className="text-xs leading-5 text-muted">Use fictional sample content for this portfolio project. Do not present it as a genuine customer endorsement.</p>
    {state.status === "success" && <p role="status" className="rounded-xl bg-[#eaf0e8] p-4 text-sm text-sea">Testimonial saved. {state.id && <Link href={`/admin/testimonials/${state.id}/edit`} className="font-semibold underline">Edit testimonial</Link>}</p>}
    {state.status === "error" && <p role="alert" className="text-sm text-red-800">The testimonial could not be saved. Please try again.</p>}
    {state.status === "notFound" && <p role="alert" className="text-sm text-red-800">This testimonial no longer exists.</p>}
    <div className="flex flex-wrap items-center gap-5"><button type="submit" disabled={pending} className="min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : testimonial ? "Save changes" : "Create testimonial"}</button><Link href="/admin/testimonials" className="text-sm font-semibold text-sea hover:underline">Back to testimonials</Link></div>
  </form>;
}
