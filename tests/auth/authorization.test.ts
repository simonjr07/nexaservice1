import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findUnique, redirect } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));

import { ForbiddenError, requireAdmin, requireStaff } from "@/server/auth/authorization";

const user = { id: "73affcbe-9500-4ac5-b5c8-b0d7b89ee698", name: "Example Staff", email: "staff@example.test" };

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: user.id, role: "ADMIN" } });
  findUnique.mockResolvedValue({ ...user, role: "ADMIN", status: "ACTIVE" });
});

describe("server authorization", () => {
  it("redirects a visitor before accessing the user table", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(requireStaff()).rejects.toThrow("REDIRECT:/admin/login");
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("lets STAFF and ADMIN enter the general dashboard", async () => {
    findUnique.mockResolvedValueOnce({ ...user, role: "STAFF", status: "ACTIVE" }).mockResolvedValueOnce({ ...user, role: "ADMIN", status: "ACTIVE" });
    await expect(requireStaff()).resolves.toMatchObject({ role: "STAFF" });
    await expect(requireStaff()).resolves.toMatchObject({ role: "ADMIN" });
  });

  it("denies STAFF an ADMIN-only operation based on the current database role", async () => {
    findUnique.mockResolvedValue({ ...user, role: "STAFF", status: "ACTIVE" });
    await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("lets ADMIN pass the ADMIN-only check", async () => {
    await expect(requireAdmin()).resolves.toMatchObject({ role: "ADMIN" });
  });

  it("redirects after the account is removed even if a JWT still exists", async () => {
    findUnique.mockResolvedValue(null);
    await expect(requireStaff()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("redirects an already signed-in user after the account is disabled", async () => {
    findUnique.mockResolvedValue({ ...user, role: "STAFF", status: "DISABLED" });
    await expect(requireStaff()).rejects.toThrow("REDIRECT:/admin/login");
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: user.id, status: "ACTIVE" } }));
  });
});
