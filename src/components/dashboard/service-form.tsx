"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ServiceRecord } from "@/server/db/repositories/services";
import type { ServiceActionState } from "@/features/services/validation";
import { initialServiceActionState } from "@/features/services/validation";

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20";

export function ServiceForm({ action, service }: {
  action: (state: ServiceActionState, formData: FormData) => Promise<ServiceActionState>;
  service?: ServiceRecord;
}) {
  const [state, formAction, pending] = useActionState(action, initialServiceActionState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={formAction} noValidate className="mt-8 max-w-3xl space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
      <div>
        <label htmlFor="service-name" className="block text-sm font-semibold">Name <span aria-hidden="true" className="text-sea">*</span></label>
        <input id="service-name" name="name" type="text" required minLength={2} maxLength={120} defaultValue={service?.name ?? ""} aria-invalid={!!errors.name} aria-describedby={errors.name ? "service-name-error" : undefined} className={inputClass} />
        {errors.name && <p id="service-name-error" className="mt-2 text-sm text-red-800">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="service-slug" className="block text-sm font-semibold">URL slug <span aria-hidden="true" className="text-sea">*</span></label>
        <input id="service-slug" name="slug" type="text" required minLength={3} maxLength={100} defaultValue={service?.slug ?? ""} placeholder="commercial-cleaning" aria-invalid={!!errors.slug} aria-describedby={errors.slug ? "service-slug-help service-slug-error" : "service-slug-help"} className={inputClass} />
        <p id="service-slug-help" className="mt-2 text-xs leading-5 text-muted">Lowercase words separated by hyphens. Changing a published slug changes its URL; redirects are not created.</p>
        {errors.slug && <p id="service-slug-error" className="mt-2 text-sm text-red-800">{errors.slug}</p>}
      </div>
      <div>
        <label htmlFor="service-short" className="block text-sm font-semibold">Short description <span aria-hidden="true" className="text-sea">*</span></label>
        <textarea id="service-short" name="shortDescription" rows={3} required minLength={10} maxLength={300} defaultValue={service?.shortDescription ?? ""} aria-invalid={!!errors.shortDescription} aria-describedby={errors.shortDescription ? "service-short-error" : undefined} className={inputClass} />
        {errors.shortDescription && <p id="service-short-error" className="mt-2 text-sm text-red-800">{errors.shortDescription}</p>}
      </div>
      <div>
        <label htmlFor="service-description" className="block text-sm font-semibold">Description <span aria-hidden="true" className="text-sea">*</span></label>
        <textarea id="service-description" name="description" rows={9} required minLength={20} maxLength={5000} defaultValue={service?.description ?? ""} aria-invalid={!!errors.description} aria-describedby={errors.description ? "service-description-error" : undefined} className={inputClass} />
        {errors.description && <p id="service-description-error" className="mt-2 text-sm text-red-800">{errors.description}</p>}
      </div>
      <label className="flex items-start gap-3 rounded-xl bg-[#f7f9f7] p-4 text-sm">
        <input name="published" type="checkbox" defaultChecked={service?.published ?? false} className="mt-1 accent-sea" />
        <span><span className="font-semibold">Publish this service</span><span className="mt-1 block text-muted">Published services appear on the website and can be selected in enquiries. New services remain drafts unless you select this.</span></span>
      </label>
      {state.status === "success" && <p role="status" className="rounded-xl bg-[#eaf0e8] p-4 text-sm text-sea">Service saved. {state.id && <Link href={`/admin/services/${state.id}/edit`} className="font-semibold underline">Edit service</Link>}</p>}
      {state.status === "notFound" && <p role="alert" className="text-sm text-red-800">This service no longer exists.</p>}
      {state.status === "error" && <p role="alert" className="text-sm text-red-800">The service could not be saved. Please try again.</p>}
      {state.status === "duplicate" && <p role="alert" className="text-sm text-red-800">This slug is already in use.</p>}
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : service ? "Save changes" : "Create service"}</button>
        <Link href="/admin/services" className="text-sm font-semibold text-sea underline-offset-4 hover:underline">Back to services</Link>
      </div>
    </form>
  );
}
