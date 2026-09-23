import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createPublicEnquiry } from "@/features/enquiry/create-enquiry";

const rollback = new Error("ROLLBACK_ENQUIRY_TEST");

describe.skipIf(process.env.RUN_DATABASE_TESTS !== "1")("PostgreSQL lead intake", () => {
  it("stores NEW unassigned leads, with or without a published service, and rolls back", async () => {
    const { config } = await import("dotenv");
    config({ quiet: true });
    const { prisma } = await import("@/server/db/client");
    const { createLeadIntakeRepository } = await import("@/server/db/repositories/lead-intake");
    const marker = randomUUID();

    try {
      await prisma.$transaction(async (tx) => {
        const published = await tx.service.create({
          data: { name: `Published ${marker}`, slug: `published-${marker}`, shortDescription: "Test", description: "Transactional test service", published: true },
        });
        const unpublished = await tx.service.create({
          data: { name: `Unpublished ${marker}`, slug: `unpublished-${marker}`, shortDescription: "Test", description: "Transactional test service", published: false },
        });
        const repository = createLeadIntakeRepository(tx);
        expect(await repository.listPublishedServices()).toContainEqual({ id: published.id, name: published.name });
        expect(await repository.listPublishedServices()).not.toContainEqual({ id: unpublished.id, name: unpublished.name });

        const firstEmail = `enquiry-${marker}@example.test`;
        await expect(createPublicEnquiry({
          name: "  Test Visitor  ", email: firstEmail.toUpperCase(), phone: "", company: "",
          message: "Please review our project requirements.", serviceId: published.id, website: "",
        }, repository)).resolves.toEqual({ status: "success" });

        const stored = await tx.lead.findFirstOrThrow({ where: { email: firstEmail } });
        expect(stored).toMatchObject({ name: "Test Visitor", status: "NEW", assignedUserId: null, serviceId: published.id, phone: null, company: null });

        await expect(createPublicEnquiry({
          name: "Test Visitor", email: `general-${marker}@example.test`, phone: null, company: null,
          message: "I am not sure which service I need.", serviceId: null, website: null,
        }, repository)).resolves.toEqual({ status: "success" });
        const general = await tx.lead.findFirstOrThrow({ where: { email: `general-${marker}@example.test` } });
        expect(general).toMatchObject({ status: "NEW", assignedUserId: null, serviceId: null });

        await expect(createPublicEnquiry({
          name: "Test Visitor", email: `unpublished-${marker}@example.test`, phone: "", company: "",
          message: "I would like to ask about a service.", serviceId: unpublished.id, website: "",
        }, repository)).resolves.toEqual({ status: "invalid", fieldErrors: { serviceId: "Choose an available service." } });
        expect(await tx.lead.count({ where: { email: `unpublished-${marker}@example.test` } })).toBe(0);
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    } finally {
      await prisma.$disconnect();
    }
  }, 20_000);
});
