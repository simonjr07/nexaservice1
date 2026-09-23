import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getAdminSettings } from "@/features/website-content/manage-content";
import { requireAdmin } from "@/server/auth/authorization";
import { websiteContentRepository } from "@/server/db/repositories/website-content";
import { saveSettingsAction } from "./actions";

export const metadata: Metadata = { title: "Website settings" };

export default async function AdminSettingsPage() {
  const user = await requireAdmin();
  let settings: Awaited<ReturnType<typeof getAdminSettings>>;
  try {
    settings = await getAdminSettings(user, websiteContentRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">Settings could not be loaded. Please try again.</p>;
  }
  return <><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Settings</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Website settings</h1><p className="mt-3 text-sm leading-6 text-muted">Manage the public business name and contact details for this single-business site.</p><SettingsForm settings={settings} action={saveSettingsAction} /></>;
}
