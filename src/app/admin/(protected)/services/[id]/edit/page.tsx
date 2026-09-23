import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/dashboard/service-form";
import { getAdminService } from "@/features/services/manage-services";
import { requireAdmin } from "@/server/auth/authorization";
import { serviceRepository } from "@/server/db/repositories/services";
import { editServiceAction } from "../../actions";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  let service: Awaited<ReturnType<typeof getAdminService>>;
  try {
    service = await getAdminService(user, (await params).id, serviceRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">This service could not be loaded. Please try again.</p>;
  }
  if (!service) notFound();
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Services / Edit</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Edit {service.name}</h1>
    <p className="mt-3 text-sm text-muted">{service.published ? "This service is public." : "This service is a private draft."} Changing its published slug changes the public URL.</p>
    <ServiceForm action={editServiceAction.bind(null, service.id)} service={service} />
  </>;
}
