import "server-only";

import { assertStaffRole } from "@/server/auth/authorization";
import type { StaffIdentity } from "@/server/auth/credentials";
import type { DashboardAnalyticsRepository } from "@/server/db/repositories/dashboard-analytics";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/validation";

export type DashboardAnalytics = {
  totalLeads: number;
  leadsThisMonth: number;
  statusCounts: Record<LeadStatus, number>;
  months: Array<{ year: number; month: number; label: string; count: number }>;
  recentLeads: Awaited<ReturnType<DashboardAnalyticsRepository["recentLeads"]>>;
  requestedServices: Awaited<ReturnType<DashboardAnalyticsRepository["requestedServices"]>>;
};

export function sixMonthWindow(now: Date) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const start = new Date(Date.UTC(year, month - 5, 1));
  const currentStart = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 5 + index, 1));
    return {
      year: date.getUTCFullYear(), month: date.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(date),
    };
  });
  return { start, currentStart, end, months };
}

export async function getDashboardAnalytics(user: StaffIdentity, now: Date, repository: DashboardAnalyticsRepository): Promise<DashboardAnalytics> {
  assertStaffRole(user.role);
  const window = sixMonthWindow(now);
  const [statuses, leadsThisMonth, monthlyRows, recentLeads, requestedServices] = await Promise.all([
    repository.statusCounts(),
    repository.monthCount(window.currentStart, window.end),
    repository.monthlyCounts(window.start, window.end),
    repository.recentLeads(),
    repository.requestedServices(),
  ]);
  const statusCounts = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<LeadStatus, number>;
  for (const row of statuses) statusCounts[row.status] = row.count;
  const totalLeads = LEAD_STATUSES.reduce((sum, status) => sum + statusCounts[status], 0);
  const monthCounts = new Map(monthlyRows.map((row) => [`${row.year}-${row.month}`, Number(row.count)]));
  const months = window.months.map((month) => ({ ...month, count: monthCounts.get(`${month.year}-${month.month}`) ?? 0 }));
  return { totalLeads, leadsThisMonth, statusCounts, months, recentLeads, requestedServices };
}
