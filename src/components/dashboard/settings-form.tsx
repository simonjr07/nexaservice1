"use client";

import { useActionState } from "react";
import type { SettingsRecord } from "@/server/db/repositories/website-content";
import { initialSettingsState, type ContentActionState, type SettingsField } from "@/features/website-content/validation";

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20";

export function SettingsForm({ settings, action }: {
  settings: SettingsRecord | null;
  action: (state: ContentActionState<SettingsField>, data: FormData) => Promise<ContentActionState<SettingsField>>;
}) {
  const [state, formAction, pending] = useActionState(action, initialSettingsState);
  const errors = state.fieldErrors ?? {};
  return <form action={formAction} noValidate className="mt-8 max-w-3xl space-y-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
    {!settings && <p className="rounded-xl bg-[#eaf0e8] p-4 text-sm leading-6 text-ink">No business settings have been saved. Complete all fields to create the single business configuration.</p>}
    <div><label htmlFor="settings-business" className="block text-sm font-semibold">Business name <span aria-hidden="true" className="text-sea">*</span></label><input id="settings-business" name="businessName" required minLength={2} maxLength={120} defaultValue={settings?.businessName ?? "NexaService"} aria-invalid={!!errors.businessName} aria-describedby={errors.businessName ? "settings-business-error" : undefined} className={inputClass} />{errors.businessName && <p id="settings-business-error" className="mt-2 text-sm text-red-800">{errors.businessName}</p>}</div>
    <div><label htmlFor="settings-email" className="block text-sm font-semibold">Public email <span aria-hidden="true" className="text-sea">*</span></label><input id="settings-email" name="email" type="email" required maxLength={254} defaultValue={settings?.email ?? ""} aria-invalid={!!errors.email} aria-describedby={errors.email ? "settings-email-error" : undefined} className={inputClass} />{errors.email && <p id="settings-email-error" className="mt-2 text-sm text-red-800">{errors.email}</p>}</div>
    <div><label htmlFor="settings-phone" className="block text-sm font-semibold">Public phone <span aria-hidden="true" className="text-sea">*</span></label><input id="settings-phone" name="phone" type="tel" required minLength={7} maxLength={40} defaultValue={settings?.phone ?? ""} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "settings-phone-error" : undefined} className={inputClass} />{errors.phone && <p id="settings-phone-error" className="mt-2 text-sm text-red-800">{errors.phone}</p>}</div>
    <div><label htmlFor="settings-address" className="block text-sm font-semibold">Public address <span aria-hidden="true" className="text-sea">*</span></label><textarea id="settings-address" name="address" rows={3} required minLength={5} maxLength={300} defaultValue={settings?.address ?? ""} aria-invalid={!!errors.address} aria-describedby={errors.address ? "settings-address-error" : undefined} className={inputClass} />{errors.address && <p id="settings-address-error" className="mt-2 text-sm text-red-800">{errors.address}</p>}</div>
    <p className="text-xs leading-5 text-muted">These details are displayed publicly. Use fictional development information for this portfolio project.</p>
    {state.status === "success" && <p role="status" className="rounded-xl bg-[#eaf0e8] p-4 text-sm text-sea">Website settings saved.</p>}
    {state.status === "error" && <p role="alert" className="text-sm text-red-800">Settings could not be saved. Please try again.</p>}
    <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : settings ? "Save settings" : "Create settings"}</button>
  </form>;
}
