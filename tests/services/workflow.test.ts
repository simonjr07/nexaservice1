import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, redirect, notFound, connection, revalidatePath, listPublishedServices, repository } = vi.hoisted(() => ({
  getServerSession: vi.fn(), findUnique: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
  connection: vi.fn(), revalidatePath: vi.fn(), listPublishedServices: vi.fn(),
  repository: {
    listAll: vi.fn(), findAdmin: vi.fn(), listPublished: vi.fn(), findPublished: vi.fn(),
    slugExists: vi.fn(), create: vi.fn(), update: vi.fn(), setPublished: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect, notFound }));
vi.mock("next/server", () => ({ connection }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/server/db/repositories/services", () => ({ serviceRepository: repository }));
vi.mock("@/server/db/repositories/lead-intake", () => ({ leadIntakeRepository: { listPublishedServices } }));

import AdminServicesPage from "@/app/admin/(protected)/services/page";
import NewServicePage from "@/app/admin/(protected)/services/new/page";
import EditServicePage from "@/app/admin/(protected)/services/[id]/edit/page";
import ServicesPage from "@/app/(public)/services/page";
import Home from "@/app/(public)/page";
import ContactPage from "@/app/(public)/contact/page";
import ServiceDetailPage, { generateMetadata } from "@/app/(public)/services/[slug]/page";
import { createServiceAction, editServiceAction, setServicePublicationAction } from "@/app/admin/(protected)/services/actions";
import { initialServiceActionState } from "@/features/services/validation";

const id = "1380de89-e26f-4e8b-a90d-5309a627f6bd";
const serviceId = "7e7c41a8-115f-4782-9541-5a1292d5a4af";
const admin = { id, name: "Admin", email: "admin@example.test", role: "ADMIN" };
const record = { id: serviceId, name: "Workspace care", slug: "workspace-care", shortDescription: "Care for shared workspaces.", description: "Practical support for busy shared workspaces.", published: false, createdAt: new Date(), updatedAt: new Date() };

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: record.name, slug: record.slug, shortDescription: record.shortDescription, description: record.description, ...overrides })) data.set(key, value);
  return data;
}

function pageText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(pageText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: unknown; href?: string };
    return `${props.href ?? ""} ${pageText(props.children)}`;
  }
  return "";
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id } });
  findUnique.mockResolvedValue(admin);
  repository.listAll.mockResolvedValue([]);
  repository.findAdmin.mockResolvedValue(record);
  repository.listPublished.mockResolvedValue([]);
  listPublishedServices.mockResolvedValue([]);
  repository.findPublished.mockResolvedValue(null);
  repository.slugExists.mockResolvedValue(false);
  repository.create.mockResolvedValue({ id: serviceId });
  repository.update.mockResolvedValue(true);
  repository.setPublished.mockResolvedValue(true);
});

describe("administrator service workflow", () => {
  it("allows ADMIN to create a draft and requires authentication for management", async () => {
    await expect(createServiceAction(initialServiceActionState, form())).resolves.toEqual({ status: "success", id: serviceId });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "workspace-care", published: false }));
    getServerSession.mockResolvedValue(null);
    await expect(AdminServicesPage()).rejects.toThrow("REDIRECT:/admin/login");
    await expect(NewServicePage()).rejects.toThrow("REDIRECT:/admin/login");
    await expect(createServiceAction(initialServiceActionState, form())).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("denies STAFF pages and direct create, edit, and publish actions", async () => {
    findUnique.mockResolvedValue({ ...admin, role: "STAFF" });
    await expect(AdminServicesPage()).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(EditServicePage({ params: Promise.resolve({ id: serviceId }) })).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(createServiceAction(initialServiceActionState, form())).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(editServiceAction(serviceId, initialServiceActionState, form())).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(setServicePublicationAction(serviceId, true, initialServiceActionState)).rejects.toMatchObject({ name: "ForbiddenError" });
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.setPublished).not.toHaveBeenCalled();
  });

  it("validates required fields, slug normalization, and duplicate slugs", async () => {
    const empty = await createServiceAction(initialServiceActionState, new FormData());
    expect(empty.status).toBe("invalid");
    expect(empty.fieldErrors).toMatchObject({ name: expect.any(String), slug: expect.any(String), shortDescription: expect.any(String), description: expect.any(String) });
    await expect(createServiceAction(initialServiceActionState, form({ slug: "  WORKSPACE Care " }))).resolves.toEqual({ status: "success", id: serviceId });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "workspace-care" }));
    repository.slugExists.mockResolvedValue(true);
    await expect(createServiceAction(initialServiceActionState, form())).resolves.toMatchObject({ status: "duplicate" });
    expect(repository.create).toHaveBeenCalledTimes(1);
    const malformedPublication = form();
    malformedPublication.set("published", "unexpected");
    await expect(createServiceAction(initialServiceActionState, malformedPublication)).resolves.toMatchObject({ status: "invalid", fieldErrors: { published: expect.any(String) } });
  });

  it("handles a unique constraint race without exposing database details", async () => {
    repository.create.mockRejectedValue({ code: "P2002", private: "database details" });
    const result = await createServiceAction(initialServiceActionState, form());
    expect(result).toMatchObject({ status: "duplicate" });
    expect(JSON.stringify(result)).not.toContain("database details");
  });

  it("allows ADMIN to edit without changing an unchanged slug and to publish/unpublish", async () => {
    await expect(editServiceAction(serviceId, initialServiceActionState, form({ name: "Updated workspace care" }))).resolves.toEqual({ status: "success", id: serviceId });
    expect(repository.update).toHaveBeenCalledWith(serviceId, expect.objectContaining({ slug: record.slug, name: "Updated workspace care" }));
    await expect(setServicePublicationAction(serviceId, true, initialServiceActionState)).resolves.toEqual({ status: "success", id: serviceId });
    await expect(setServicePublicationAction(serviceId, false, initialServiceActionState)).resolves.toEqual({ status: "success", id: serviceId });
    expect(repository.setPublished.mock.calls).toEqual([[serviceId, true], [serviceId, false]]);
    expect(revalidatePath).toHaveBeenCalledWith("/services");
    expect(revalidatePath).toHaveBeenCalledWith("/contact");
  });

  it("shows only repository-provided published services and 404s unpublished detail", async () => {
    repository.listPublished.mockResolvedValue([{ id: serviceId, name: record.name, slug: record.slug, shortDescription: record.shortDescription }]);
    const listing = await ServicesPage();
    expect(pageText(listing)).toContain(record.slug);
    expect(repository.listPublished).toHaveBeenCalledOnce();
    await expect(ServiceDetailPage({ params: Promise.resolve({ slug: record.slug }) })).rejects.toThrow("NOT_FOUND");
    await expect(generateMetadata({ params: Promise.resolve({ slug: record.slug }) })).rejects.toThrow("NOT_FOUND");
    repository.findPublished.mockResolvedValue({ id: serviceId, name: record.name, slug: record.slug, shortDescription: record.shortDescription, description: record.description });
    const detail = await ServiceDetailPage({ params: Promise.resolve({ slug: record.slug }) });
    expect(pageText(detail)).toContain(`/contact?serviceId=${serviceId}#request-quote`);
    expect(await generateMetadata({ params: Promise.resolve({ slug: record.slug }) })).toMatchObject({ title: record.name });
  });

  it("uses published Services on the homepage and preselects only published quote choices", async () => {
    repository.listPublished.mockResolvedValue([{ id: serviceId, name: record.name, slug: record.slug, shortDescription: record.shortDescription }]);
    expect(pageText(await Home())).toContain(`/services/${record.slug}`);
    listPublishedServices.mockResolvedValue([{ id: serviceId, name: record.name }]);
    const selected = await ContactPage({ searchParams: Promise.resolve({ serviceId }) });
    expect(findProp(selected, "initialServiceId")).toBe(serviceId);
    listPublishedServices.mockResolvedValue([]);
    const unavailable = await ContactPage({ searchParams: Promise.resolve({ serviceId }) });
    expect(findProp(unavailable, "initialServiceId")).toBe("");
  });
});

function findProp(node: unknown, name: string): unknown {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProp(item, name);
      if (found !== undefined) return found;
    }
  }
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as Record<string, unknown>;
    if (name in props) return props[name];
    return findProp(props.children, name);
  }
  return undefined;
}
