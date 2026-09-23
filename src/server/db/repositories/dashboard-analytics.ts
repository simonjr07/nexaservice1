import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { LeadStatus } from "@/features/leads/validation";
import { prisma } from "@/server/db/client";

export type StatusCountRow = { status: LeadStatus; count: number };
export type MonthCountRow = { year: number; month: number; count: bigint };
export type RecentLeadRow = {
  id: string;
  name: string;
  status: LeadStatus;
  createdAt: Date;
  serviceId: string | null;
  service: { name: string } | null;
};
export type RequestedServiceRow = { id: string; name: string; published: boolean; count: number };

export type DashboardAnalyticsRepository = {
  statusCounts(): Promise<StatusCountRow[]>;
  monthCount(start: Date, end: Date): Promise<number>;
  monthlyCounts(start: Date, end: Date): Promise<MonthCountRow[]>;
  recentLeads(): Promise<RecentLeadRow[]>;
  requestedServices(): Promise<RequestedServiceRow[]>;
};

export function createDashboardAnalyticsRepository(db: Pick<PrismaClient, "lead" | "service" | "$queryRaw">): DashboardAnalyticsRepository {
  return {
    async statusCounts() {
      const rows = await db.lead.groupBy({ by: ["status"], _count: { _all: true } });
      return rows.map((row) => ({ status: row.status, count: row._count._all }));
    },
    monthCount: (start, end) => db.lead.count({ where: { createdAt: { gte: start, lt: end } } }),
    monthlyCounts: (start, end) => db.$queryRaw<MonthCountRow[]>`
      SELECT EXTRACT(YEAR FROM "createdAt")::integer AS year,
             EXTRACT(MONTH FROM "createdAt")::integer AS month,
             COUNT(*) AS count
      FROM "Lead"
      WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
      GROUP BY 1, 2
      ORDER BY 1, 2
    `,
    recentLeads: () => db.lead.findMany({
      select: {
        id: true, name: true, status: true, createdAt: true, serviceId: true,
        service: { select: { name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
    async requestedServices() {
      const rows = await db.service.findMany({
        where: { leads: { some: {} } },
        select: { id: true, name: true, published: true, _count: { select: { leads: true } } },
        orderBy: [{ leads: { _count: "desc" } }, { name: "asc" }, { id: "asc" }],
        take: 5,
      });
      return rows.map((row) => ({ id: row.id, name: row.name, published: row.published, count: row._count.leads }));
    },
  };
}

export const dashboardAnalyticsRepository = createDashboardAnalyticsRepository(prisma);
