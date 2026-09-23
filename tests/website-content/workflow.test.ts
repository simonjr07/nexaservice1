import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, redirect, notFound, connection, revalidatePath, serviceList, repository } = vi.hoisted(() => ({
  getServerSession: vi.fn(), findUnique: vi.fn(), connection: vi.fn(), revalidatePath: vi.fn(), serviceList: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
  repository: {
    listTestimonials: vi.fn(), findTestimonial: vi.fn(), listPublishedTestimonials: vi.fn(),
    createTestimonial: vi.fn(), updateTestimonial: vi.fn(), setTestimonialPublished: vi.fn(),
    getSettings: vi.fn(), saveSettings: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect, notFound }));
vi.mock("next/server", () => ({ connection }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/server/db/repositories/website-content", () => ({ websiteContentRepository: repository }));
vi.mock("@/server/db/repositories/services", () => ({ serviceRepository: { listPublished: serviceList } }));

import AdminTestimonialsPage from "@/app/admin/(protected)/testimonials/page";
import NewTestimonialPage from "@/app/admin/(protected)/testimonials/new/page";
import EditTestimonialPage from "@/app/admin/(protected)/testimonials/[id]/edit/page";
import AdminSettingsPage from "@/app/admin/(protected)/settings/page";
import { createTestimonialAction, editTestimonialAction, setTestimonialPublicationAction } from "@/app/admin/(protected)/testimonials/actions";
import { saveSettingsAction } from "@/app/admin/(protected)/settings/actions";
import Home from "@/app/(public)/page";
import PublicLayout from "@/app/(public)/layout";
import { getPublicSettings, listPublishedTestimonials, publicSettingsFallback } from "@/features/website-content/manage-content";
import { initialSettingsState, initialTestimonialState } from "@/features/website-content/validation";

const userId = "1380de89-e26f-4e8b-a90d-5309a627f6bd";
const itemId = "7e7c41a8-115f-4782-9541-5a1292d5a4af";
const admin = { id: userId, name: "Admin", email: "admin@example.test", role: "ADMIN" };
const item = { id: itemId, customerName: "Sample Client", company: null, content: "A fictional example of clear, practical support.", published: false, createdAt: new Date(), updatedAt: new Date() };
const settings = { businessName: "Example Works", email: "hello@example.test", phone: "+1 555 010 2222", address: "10 Example Street, Sample City", updatedAt: new Date() };

function testimonialForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ customerName: item.customerName, company: "", content: item.content, ...overrides })) form.set(key, value);
  return form;
}

function settingsForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ businessName: settings.businessName, email: settings.email, phone: settings.phone, address: settings.address, ...overrides })) form.set(key, value);
  return form;
}

function pageText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(pageText).join(" ");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: unknown; href?: string; businessName?: string };
    return `${props.href ?? ""} ${props.businessName ?? ""} ${pageText(props.children)}`;
  }
  return "";
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: userId } });
  findUnique.mockResolvedValue(admin);
  repository.listTestimonials.mockResolvedValue([]);
  repository.findTestimonial.mockResolvedValue(item);
  repository.listPublishedTestimonials.mockResolvedValue([]);
  repository.createTestimonial.mockResolvedValue({ id: itemId });
  repository.updateTestimonial.mockResolvedValue(true);
  repository.setTestimonialPublished.mockResolvedValue(true);
  repository.getSettings.mockResolvedValue(null);
  repository.saveSettings.mockResolvedValue(settings);
  serviceList.mockResolvedValue([]);
});

describe("website content administration", () => {
  it("lets ADMIN create a private testimonial by default and validates content", async () => {
    await expect(createTestimonialAction(initialTestimonialState, testimonialForm())).resolves.toEqual({ status: "success", id: itemId });
    expect(repository.createTestimonial).toHaveBeenCalledWith(expect.objectContaining({ published: false, company: null }));
    const noCompany = testimonialForm();
    noCompany.delete("company");
    await expect(createTestimonialAction(initialTestimonialState, noCompany)).resolves.toEqual({ status: "success", id: itemId });
    const invalid = await createTestimonialAction(initialTestimonialState, testimonialForm({ content: "too short" }));
    expect(invalid).toMatchObject({ status: "invalid", fieldErrors: { content: expect.any(String) } });
    expect(repository.createTestimonial).toHaveBeenCalledTimes(2);
  });

  it("lets ADMIN edit and publish/unpublish testimonials", async () => {
    await expect(editTestimonialAction(itemId, initialTestimonialState, testimonialForm({ customerName: "Updated sample" }))).resolves.toEqual({ status: "success", id: itemId });
    expect(repository.updateTestimonial).toHaveBeenCalledWith(itemId, expect.objectContaining({ customerName: "Updated sample" }));
    await expect(setTestimonialPublicationAction(itemId, true, initialTestimonialState)).resolves.toEqual({ status: "success", id: itemId });
    await expect(setTestimonialPublicationAction(itemId, false, initialTestimonialState)).resolves.toEqual({ status: "success", id: itemId });
    expect(repository.setTestimonialPublished.mock.calls).toEqual([[itemId, true], [itemId, false]]);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("denies STAFF and visitors on management pages and direct actions", async () => {
    findUnique.mockResolvedValue({ ...admin, role: "STAFF" });
    await expect(AdminTestimonialsPage()).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(EditTestimonialPage({ params: Promise.resolve({ id: itemId }) })).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(AdminSettingsPage()).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(createTestimonialAction(initialTestimonialState, testimonialForm())).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(setTestimonialPublicationAction(itemId, true, initialTestimonialState)).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(saveSettingsAction(initialSettingsState, settingsForm())).rejects.toMatchObject({ name: "ForbiddenError" });
    expect(repository.createTestimonial).not.toHaveBeenCalled();
    expect(repository.saveSettings).not.toHaveBeenCalled();
    getServerSession.mockResolvedValue(null);
    await expect(NewTestimonialPage()).rejects.toThrow("REDIRECT:/admin/login");
    await expect(saveSettingsAction(initialSettingsState, settingsForm())).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("validates settings email and saves one approved configuration", async () => {
    const invalid = await saveSettingsAction(initialSettingsState, settingsForm({ email: "not-an-email" }));
    expect(invalid).toMatchObject({ status: "invalid", fieldErrors: { email: expect.any(String) } });
    expect(repository.saveSettings).not.toHaveBeenCalled();
    const form = settingsForm({ email: "  HELLO@EXAMPLE.TEST  " });
    await expect(saveSettingsAction(initialSettingsState, form)).resolves.toEqual({ status: "success" });
    expect(repository.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ email: "hello@example.test" }));
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("keeps public reads side effect free and excludes unpublished testimonials", async () => {
    expect(await getPublicSettings()).toEqual(publicSettingsFallback);
    expect(repository.saveSettings).not.toHaveBeenCalled();
    expect(await listPublishedTestimonials()).toEqual([]);
    expect(pageText(await Home())).not.toContain(item.content);
    repository.getSettings.mockResolvedValue(settings);
    repository.listPublishedTestimonials.mockResolvedValue([{ id: itemId, customerName: item.customerName, company: null, content: item.content }]);
    const home = await Home();
    expect(pageText(home)).toContain(item.content);
    expect(pageText(home)).toContain("not real customer endorsements");
    expect(pageText(home)).toContain(settings.businessName);
    const layout = await PublicLayout({ children: null });
    expect(pageText(layout)).toContain(settings.businessName);
  });
});
