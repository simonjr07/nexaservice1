import type { Metadata } from "next";
import Link from "next/link";
import { ServicePublicationForm } from "@/components/dashboard/service-publication-form";
import { listAdminServices } from "@/features/services/manage-services";
import { requireAdmin } from "@/server/auth/authorization";
import { serviceRepository } from "@/server/db/repositories/services";
import { setServicePublicationAction } from "./actions";

export const metadata: Metadata = { title: "Manage services" };

export default async function AdminServicesPage() {
  const user = await requireAdmin();
  let services: Awaited<ReturnType<typeof listAdminServices>>;
  try {
    services = await listAdminServices(user, serviceRepository);
  } catch {
    return <p role="alert" className="rounded-2xl border border-line bg-white p-8 text-sm text-muted">Services could not be loaded. Please try again.</p>;
  }
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Dashboard / Services</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div><h1 className="text-4xl font-semibold tracking-[-0.055em]">Service management</h1><p className="mt-3 text-sm leading-6 text-muted">Draft and publish the services shown on the public website.</p></div>
      <Link href="/admin/services/new" className="inline-flex min-h-11 items-center rounded-full bg-deep px-5 text-sm font-semibold text-white hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea">Create service ↗</Link>
    </div>
    {services.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#c7d5cf] bg-white p-10"><h2 className="text-xl font-semibold">No services yet</h2><p className="mt-2 text-sm text-muted">Create a draft to begin building your public service listing.</p><Link href="/admin/services/new" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-sea hover:underline">Create your first service ↗</Link></div> :
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white"><table className="admin-records-table w-full border-collapse text-left text-sm">
        <thead className="bg-[#f7f9f7] text-xs font-semibold uppercase tracking-[0.08em] text-muted"><tr><th scope="col" className="px-5 py-4">Service</th><th scope="col" className="px-5 py-4">Slug</th><th scope="col" className="px-5 py-4">Status</th><th scope="col" className="px-5 py-4">Created / updated</th><th scope="col" className="px-5 py-4">Actions</th></tr></thead>
        <tbody className="divide-y divide-line">{services.map((service) => <tr key={service.id} className="align-top">
          <th scope="row" className="px-5 py-4 font-semibold"><Link href={`/admin/services/${service.id}/edit`} className="hover:text-sea hover:underline">{service.name}</Link></th>
          <td data-label="Slug" className="px-5 py-4 text-muted">/{service.slug}</td>
          <td data-label="Status" className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${service.published ? "bg-[#eaf0e8] text-sea" : "bg-[#f0f2f0] text-muted"}`}>{service.published ? "Published" : "Draft"}</span></td>
          <td data-label="Created / updated" className="px-5 py-4 text-xs leading-6 text-muted"><time dateTime={service.createdAt.toISOString()}>{service.createdAt.toLocaleDateString("en-GB")}</time><br /><time dateTime={service.updatedAt.toISOString()}>{service.updatedAt.toLocaleDateString("en-GB")}</time></td>
          <td data-label="Actions" className="px-5 py-4"><div className="flex flex-wrap items-center gap-4"><Link href={`/admin/services/${service.id}/edit`} className="text-sm font-semibold text-sea hover:underline">Edit</Link><ServicePublicationForm published={service.published} action={setServicePublicationAction.bind(null, service.id, !service.published)} /></div></td>
        </tr>)}</tbody>
      </table></div>}
  </>;
}
