import type { Metadata } from "next";
import { ServiceForm } from "@/components/dashboard/service-form";
import { requireAdmin } from "@/server/auth/authorization";
import { createServiceAction } from "../actions";

export const metadata: Metadata = { title: "Create service" };

export default async function NewServicePage() {
  await requireAdmin();
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Services / New</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Create a service</h1>
    <p className="mt-3 text-sm text-muted">New services stay private until you publish them.</p>
    <ServiceForm action={createServiceAction} />
  </>;
}
