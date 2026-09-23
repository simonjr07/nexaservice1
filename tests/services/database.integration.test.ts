import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const rollback = new Error("ROLLBACK_SERVICE_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL Service publication", () => {
  it("keeps historical Leads when a published Service becomes a draft", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createServiceRepository } = await import("@/server/db/repositories/services");
    const { createLeadIntakeRepository } = await import("@/server/db/repositories/lead-intake");
    const { createPublicEnquiry } = await import("@/features/enquiry/create-enquiry");
    const { createLeadManagementRepository } = await import("@/server/db/repositories/lead-management");
    const marker = randomUUID();
    try {
      await prisma.$transaction(async (tx) => {
        const services = createServiceRepository(tx);
        const intake = createLeadIntakeRepository(tx);
        const leads = createLeadManagementRepository(tx);
        const data = { name: "Test service", slug: `test-${marker}`, shortDescription: "A service in a rolled-back transaction.", description: "This service exists only inside a test transaction.", published: false };
        const { id } = await services.create(data);
        expect(await services.listPublished()).not.toContainEqual(expect.objectContaining({ id }));
        expect(await services.findPublished(data.slug)).toBeNull();
        expect(await intake.isPublishedService(id)).toBe(false);
        await services.setPublished(id, true);
        expect(await services.listPublished()).toContainEqual(expect.objectContaining({ id }));
        expect(await services.findPublished(data.slug)).toMatchObject({ id });
        expect(await intake.listPublishedServices()).toContainEqual({ id, name: data.name });
        await expect(createPublicEnquiry({ name: "Visitor", email: `visitor-${marker}@example.test`, phone: "", company: "", message: "I would like help with this service.", serviceId: id, website: "" }, intake)).resolves.toEqual({ status: "success" });
        const matching = await leads.list({ serviceId: id, page: 1 });
        expect(matching.items).toHaveLength(1);
        expect(matching.items[0].status).toBe("NEW");
        await services.setPublished(id, false);
        expect(await services.findPublished(data.slug)).toBeNull();
        expect(await intake.isPublishedService(id)).toBe(false);
        await expect(createPublicEnquiry({ name: "Another visitor", email: `other-${marker}@example.test`, phone: "", company: "", message: "I would like help with this service.", serviceId: id, website: "" }, intake)).resolves.toMatchObject({ status: "invalid" });
        const historical = await leads.detail(matching.items[0].id);
        expect(historical?.service?.name).toBe(data.name);
        expect(historical?.status).toBe("NEW");
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      await prisma.$disconnect();
    }
  }, 20_000);
});
