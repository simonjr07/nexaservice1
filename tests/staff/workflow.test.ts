import { compare } from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, redirect, revalidatePath, repository } = vi.hoisted(() => ({
  getServerSession: vi.fn(), findUnique: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
  revalidatePath: vi.fn(),
  repository: { list: vi.fn(), find: vi.fn(), create: vi.fn(), edit: vi.fn(), setStatus: vi.fn() },
}));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/server/db/repositories/staff", () => ({ staffRepository: repository }));

import StaffPage from "@/app/admin/(protected)/users/page";
import NewStaffPage from "@/app/admin/(protected)/users/new/page";
import EditStaffPage from "@/app/admin/(protected)/users/[id]/edit/page";
import { createStaffAction, editStaffAction, setStaffStatusAction } from "@/app/admin/(protected)/users/actions";
import { initialStaffActionState } from "@/features/staff/validation";
import { changeStaffStatus, createStaff, editStaff } from "@/features/staff/manage-staff";

const admin = { id: "73affcbe-9500-4ac5-b5c8-b0d7b89ee698", name: "Admin", email: "admin@example.test", role: "ADMIN" as const, status: "ACTIVE" as const };
const staffId = "387c9ce1-e64a-48df-8bf0-cbb9d535b038";
const record = { id: staffId, name: "Example Staff", email: "staff@example.test", role: "STAFF" as const, status: "ACTIVE" as const, createdAt: new Date(), updatedAt: new Date() };

function form(fields: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: record.name, email: record.email, role: "STAFF", password: "safe example password", ...fields })) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: admin.id } });
  findUnique.mockResolvedValue(admin);
  repository.list.mockResolvedValue([record]);
  repository.find.mockResolvedValue(record);
  repository.create.mockResolvedValue({ status: "success", id: staffId });
  repository.edit.mockResolvedValue("success");
  repository.setStatus.mockResolvedValue("success");
});

describe("ADMIN staff workflow", () => {
  it("creates a normalized STAFF account with a bcrypt hash and no public password data", async () => {
    const result = await createStaffAction(initialStaffActionState, form({ email: "  STAFF@EXAMPLE.TEST  " }));
    expect(result).toEqual({ status: "success", id: staffId });
    const data = repository.create.mock.calls[0][1];
    expect(data).toMatchObject({ email: "staff@example.test", role: "STAFF" });
    expect(data.passwordHash).not.toBe("safe example password");
    expect(await compare("safe example password", data.passwordHash)).toBe(true);
    expect(JSON.stringify(result)).not.toContain("password");
  });

  it("rejects invalid creation, edits without a password field, and validates status", async () => {
    const weak = await createStaffAction(initialStaffActionState, form({ password: "short", email: "bad", role: "OWNER" }));
    expect(weak).toMatchObject({ status: "invalid", fieldErrors: { email: expect.any(String), password: expect.any(String), role: expect.any(String) } });
    expect(repository.create).not.toHaveBeenCalled();
    expect(await editStaffAction(staffId, initialStaffActionState, form({ name: "Updated Staff" }))).toEqual({ status: "success", id: staffId });
    expect(repository.edit.mock.calls[0][2]).toEqual({ name: "Updated Staff", email: record.email, role: "STAFF" });
    expect(await setStaffStatusAction(staffId, "SUSPENDED", initialStaffActionState)).toMatchObject({ status: "invalid" });
    expect(repository.setStatus).not.toHaveBeenCalled();
  });

  it("returns safe duplicate and unknown-user errors", async () => {
    repository.create.mockResolvedValue({ status: "duplicate" });
    expect(await createStaffAction(initialStaffActionState, form())).toMatchObject({ status: "duplicate", fieldErrors: { email: expect.any(String) } });
    repository.edit.mockResolvedValue("notFound");
    expect(await editStaffAction(staffId, initialStaffActionState, form())).toMatchObject({ status: "notFound" });
    repository.setStatus.mockResolvedValue("notFound");
    expect(await setStaffStatusAction(staffId, "DISABLED", initialStaffActionState)).toMatchObject({ status: "notFound" });
    repository.list.mockRejectedValue(new Error("private database details"));
    expect(JSON.stringify(await StaffPage())).not.toContain("private database details");
    repository.create.mockRejectedValue(new Error("private database details"));
    const failed = await createStaffAction(initialStaffActionState, form());
    expect(failed).toEqual({ status: "error" });
    expect(JSON.stringify(failed)).not.toContain("private database details");
  });

  it("denies STAFF and visitors on pages and direct actions", async () => {
    findUnique.mockResolvedValue({ ...admin, role: "STAFF" });
    await expect(StaffPage()).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(NewStaffPage()).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(EditStaffPage({ params: Promise.resolve({ id: staffId }) })).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(createStaffAction(initialStaffActionState, form())).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(editStaffAction(staffId, initialStaffActionState, form())).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(setStaffStatusAction(staffId, "DISABLED", initialStaffActionState)).rejects.toMatchObject({ name: "ForbiddenError" });
    expect(repository.create).not.toHaveBeenCalled();
    getServerSession.mockResolvedValue(null);
    await expect(createStaffAction(initialStaffActionState, form())).rejects.toThrow("REDIRECT:/admin/login");
    await expect(StaffPage()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("checks ADMIN in the business layer even if called outside a page", async () => {
    const staff = { ...admin, role: "STAFF" as const };
    await expect(createStaff(staff, {}, repository)).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(editStaff(staff, staffId, {}, repository)).rejects.toMatchObject({ name: "ForbiddenError" });
    await expect(changeStaffStatus(staff, staffId, "DISABLED", repository)).rejects.toMatchObject({ name: "ForbiddenError" });
  });
});
