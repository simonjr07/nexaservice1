import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_DASHBOARD_ANALYTICS_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL dashboard analytics", () => {
  it("aggregates persisted Leads, orders recent enquiries, and includes unpublished Services before rollback", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createDashboardAnalyticsRepository } = await import("@/server/db/repositories/dashboard-analytics");
    const { getDashboardAnalytics } = await import("@/features/dashboard/get-dashboard-analytics");
    const user = { id: "test-staff", name: "Test Staff", email: "staff@example.test", role: "STAFF" as const };
    const now = new Date("2030-01-20T12:00:00Z");
    const before = await getDashboardAnalytics(user, now, createDashboardAnalyticsRepository(prisma));
    const marker = randomUUID();
    try {
      await prisma.$transaction(async (tx) => {
        const service = await tx.service.create({ data: {
          name: `Analytics ${marker}`, slug: `analytics-${marker}`,
          shortDescription: "Transactional analytics test", description: "This record is rolled back.", published: false,
        } });
        const dates = [
          "2029-08-01T00:00:00Z", "2029-12-31T23:59:59Z", "2030-01-01T00:00:00Z",
          "2030-01-02T00:00:00Z", "2030-01-03T00:00:00Z", "2030-01-04T00:00:00Z",
        ];
        const statuses = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST", "NEW"] as const;
        const ids: string[] = [];
        for (let index = 0; index < dates.length; index++) {
          const lead = await tx.lead.create({ data: {
            name: `Analytics visitor ${index}`, email: `analytics-${index}-${marker}@example.test`,
            message: "Please contact us about this fictional request.", status: statuses[index],
            serviceId: index === 0 ? null : service.id, createdAt: new Date(dates[index]),
          } });
          ids.push(lead.id);
        }
        const result = await getDashboardAnalytics(user, now, createDashboardAnalyticsRepository(tx));
        expect(result.totalLeads - before.totalLeads).toBe(6);
        expect(result.statusCounts.NEW - before.statusCounts.NEW).toBe(2);
        for (const status of ["CONTACTED", "QUALIFIED", "WON", "LOST"] as const) {
          expect(result.statusCounts[status] - before.statusCounts[status]).toBe(1);
        }
        expect(result.leadsThisMonth - before.leadsThisMonth).toBe(4);
        expect(result.months.map((month, index) => month.count - before.months[index].count)).toEqual([1, 0, 0, 0, 1, 4]);
        expect(result.recentLeads).toHaveLength(5);
        expect(result.recentLeads.map((lead) => lead.id)).toEqual(ids.slice(1).reverse());
        expect(result.requestedServices).toContainEqual({ id: service.id, name: service.name, published: false, count: 5 });
        throw rollback;
      }, { timeout: 20_000 });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      expect(await prisma.service.findUnique({ where: { slug: `analytics-${marker}` } })).toBeNull();
      await prisma.$disconnect();
    }
  }, 30_000);
});
