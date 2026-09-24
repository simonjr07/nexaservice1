"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { submitEnquiry } from "@/app/(public)/contact/actions";
import { initialEnquiryState, type EnquiryField } from "@/features/enquiry/validation";

type Values = Record<EnquiryField, string>;

const initialValues: Values = {
  name: "", email: "", phone: "", company: "", serviceId: "", message: "",
};

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted/60 focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60";

export function EnquiryForm({ services, initialServiceId = "", businessName = "NexaService" }: { services: { id: string; name: string }[]; initialServiceId?: string; businessName?: string }) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialEnquiryState);
  const [values, setValues] = useState<Values>(() => ({ ...initialValues, serviceId: initialServiceId }));
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.status === "invalid" ? state.fieldErrors : {};

  useEffect(() => {
    if (!pending) submitting.current = false;
  }, [pending, state]);

  useEffect(() => {
    if (state.status === "invalid") formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  function setField(field: EnquiryField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSecondSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitting.current) event.preventDefault();
    else submitting.current = true;
  }

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-[#d7e4d2] bg-[#eaf0e8] p-8 sm:p-10">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-sea text-xl text-white">✓</span>
        <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">Enquiry received.</h3>
        <p className="mt-3 text-sm leading-7 text-muted">Thanks for sharing the details. {businessName} can use them to follow up about your workplace request.</p>
        <a href="/contact#request-quote" className="mt-6 inline-block text-sm font-semibold text-sea underline-offset-4 hover:underline">Send another enquiry ↗</a>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={preventSecondSubmit} noValidate aria-busy={pending} className="space-y-6" aria-label="Request a quote">
      <fieldset disabled={pending} className="space-y-6 disabled:opacity-70">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="enquiry-name" className="block text-sm font-semibold">Name <span aria-hidden="true" className="text-sea">*</span></label>
            <input id="enquiry-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={values.name} onChange={(event) => setField("name", event.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "enquiry-name-error" : undefined} className={inputClass} />
            {errors.name && <p id="enquiry-name-error" className="mt-2 text-sm text-red-800">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="enquiry-email" className="block text-sm font-semibold">Email <span aria-hidden="true" className="text-sea">*</span></label>
            <input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={(event) => setField("email", event.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "enquiry-email-error" : undefined} className={inputClass} />
            {errors.email && <p id="enquiry-email-error" className="mt-2 text-sm text-red-800">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="enquiry-phone" className="block text-sm font-semibold">Phone <span className="font-normal text-muted">(optional)</span></label>
            <input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(event) => setField("phone", event.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "enquiry-phone-error" : undefined} className={inputClass} />
            {errors.phone && <p id="enquiry-phone-error" className="mt-2 text-sm text-red-800">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="enquiry-company" className="block text-sm font-semibold">Company <span className="font-normal text-muted">(optional)</span></label>
            <input id="enquiry-company" name="company" type="text" autoComplete="organization" maxLength={120} value={values.company} onChange={(event) => setField("company", event.target.value)} aria-invalid={!!errors.company} aria-describedby={errors.company ? "enquiry-company-error" : undefined} className={inputClass} />
            {errors.company && <p id="enquiry-company-error" className="mt-2 text-sm text-red-800">{errors.company}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="enquiry-service" className="block text-sm font-semibold">Service <span className="font-normal text-muted">(optional)</span></label>
          <select id="enquiry-service" name="serviceId" value={values.serviceId} onChange={(event) => setField("serviceId", event.target.value)} aria-invalid={!!errors.serviceId} aria-describedby={errors.serviceId ? "enquiry-service-help enquiry-service-error" : "enquiry-service-help"} className={inputClass}>
            <option value="">Not sure yet / general enquiry</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
          <p id="enquiry-service-help" className="mt-2 text-xs leading-5 text-muted">Choose a service if one fits. You can leave this blank.</p>
          {errors.serviceId && <p id="enquiry-service-error" className="mt-2 text-sm text-red-800">{errors.serviceId}</p>}
        </div>
        <div>
          <label htmlFor="enquiry-message" className="block text-sm font-semibold">How can we help? <span aria-hidden="true" className="text-sea">*</span></label>
          <textarea id="enquiry-message" name="message" rows={6} required minLength={10} maxLength={3000} value={values.message} onChange={(event) => setField("message", event.target.value)} placeholder="Tell us about your workplace, a facility issue, or the support you need." aria-invalid={!!errors.message} aria-describedby={errors.message ? "enquiry-message-error" : undefined} className={inputClass} />
          {errors.message && <p id="enquiry-message-error" className="mt-2 text-sm text-red-800">{errors.message}</p>}
        </div>
        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor="enquiry-website">Leave this field empty</label>
          <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>
      {state.status === "error" && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">We could not send your enquiry right now. Please try again.</p>}
      {state.status === "rateLimited" && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Too many enquiries were sent from this connection. Please wait 15 minutes before trying again.</p>}
      {state.status === "invalid" && <p role="alert" className="text-sm text-red-800">Please review the highlighted fields.</p>}
      <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-deep px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:cursor-wait disabled:opacity-65 sm:w-auto">
        {pending ? "Sending enquiry…" : "Send enquiry ↗"}
      </button>
      {pending && <span role="status" className="sr-only">Sending your enquiry.</span>}
      <p className="text-xs leading-5 text-muted">Fields marked * are required. Please do not include sensitive personal information.</p>
    </form>
  );
}
