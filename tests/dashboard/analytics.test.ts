import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardAnalyticsRepository } from "@/server/db/repositories/dashboard-analytics";
import { getDashboardAnalytics, sixMonthWindow } from "@/features/dashboard/get-dashboard-analytics";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

const { getServerSession, findUnique, redirect, pageRepository } = vi.hoisted(() => ({
  getServerSession: vi.fn(), findUnique: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
  pageRepository: { statusCounts: vi.fn(), monthCount: vi.fn(), monthlyCounts: vi.fn(), recentLeads: vi.fn(), requestedServices: vi.fn() },
}));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/server/db/client", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/server/db/repositories/dashboard-analytics", () => ({ dashboardAnalyticsRepository: pageRepository }));

import AdminPage from "@/app/admin/(protected)/page";

const staff = { id: "staff-id", name: "Staff", email: "staff@example.test", role: "STAFF" as const, status: "ACTIVE" };
const repo = pageRepository as DashboardAnalyticsRepository;

function visibleText(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(visibleText).join(" ");
  if (node && typeof node === "object" && "props" in node) return visibleText((node.props as { children?: unknown }).children);
  return "";
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: staff.id } });
  findUnique.mockResolvedValue(staff);
  pageRepository.statusCounts.mockResolvedValue([]);
  pageRepository.monthCount.mockResolvedValue(0);
  pageRepository.monthlyCounts.mockResolvedValue([]);
  pageRepository.recentLeads.mockResolvedValue([]);
  pageRepository.requestedServices.mockResolvedValue([]);
});

describe("dashboard analytics", () => {
  it("counts all statuses and fills zero months across a year boundary", async () => {
    pageRepository.statusCounts.mockResolvedValue([{ status: "NEW", count: 4 }, { status: "CONTACTED", count: 2 }, { status: "WON", count: 1 }]);
    pageRepository.monthCount.mockResolvedValue(3);
    pageRepository.monthlyCounts.mockResolvedValue([{ year: 2025, month: 9, count: BigInt(2) }, { year: 2026, month: 1, count: BigInt(3) }]);
    const result = await getDashboardAnalytics(staff, new Date("2026-01-15T12:00:00Z"), repo);
    expect(result.totalLeads).toBe(7);
    expect(result.statusCounts).toEqual({ NEW: 4, CONTACTED: 2, QUALIFIED: 0, WON: 1, LOST: 0 });
    expect(result.leadsThisMonth).toBe(3);
    expect(result.months.map(({ label, count }) => [label, count])).toEqual([
      ["Aug 2025", 0], ["Sept 2025", 2], ["Oct 2025", 0], ["Nov 2025", 0], ["Dec 2025", 0], ["Jan 2026", 3],
    ]);
    expect(pageRepository.monthCount).toHaveBeenCalledWith(new Date("2026-01-01T00:00:00.000Z"), new Date("2026-02-01T00:00:00.000Z"));
    expect(sixMonthWindow(new Date("2026-01-15T12:00:00Z")).start).toEqual(new Date("2025-08-01T00:00:00.000Z"));
  });

  it("requires login before querying, and allows both STAFF and ADMIN", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(AdminPage()).rejects.toThrow("REDIRECT:/admin/login");
    expect(pageRepository.statusCounts).not.toHaveBeenCalled();
    getServerSession.mockResolvedValue({ user: { id: staff.id } });
    expect(await AdminPage()).toHaveProperty("props.analytics.totalLeads", 0);
    findUnique.mockResolvedValue({ ...staff, role: "ADMIN" });
    expect(await AdminPage()).toHaveProperty("props.analytics.totalLeads", 0);
  });

  it("shows a safe database error and supports empty states", async () => {
    pageRepository.statusCounts.mockRejectedValue(new Error("private database connection string"));
    const failed = await AdminPage();
    expect(visibleText(failed)).toContain("Dashboard unavailable");
    expect(visibleText(failed)).not.toContain("private database connection string");
    pageRepository.statusCounts.mockResolvedValue([]);
    const empty = await getDashboardAnalytics(staff, new Date("2026-01-15T12:00:00Z"), repo);
    expect(empty.totalLeads).toBe(0);
    expect(empty.recentLeads).toEqual([]);
    expect(empty.requestedServices).toEqual([]);
    const html = renderToStaticMarkup(createElement(AnalyticsOverview, { analytics: empty }));
    expect(html).toContain("No enquiries have been received yet");
    expect(html).toContain("No enquiries are linked to a Service yet");
  });
});
