import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPublicEnquiry } from "@/features/enquiry/create-enquiry";
import type { LeadIntakeRepository, NewLeadData } from "@/server/db/repositories/lead-intake";

const publishedId = randomUUID();
const unpublishedId = randomUUID();
const leads: NewLeadData[] = [];

const repository: LeadIntakeRepository = {
  listPublishedServices: async () => [{ id: publishedId, name: "Workspace care" }],
  isPublishedService: vi.fn(async (id) => id === publishedId),
  createLead: vi.fn(async (data) => { leads.push(data); }),
};

const valid = {
  name: "  Ada Example  ",
  email: "  ADA@EXAMPLE.TEST  ",
  phone: "",
  company: "  ",
  message: "  Please help us plan a workspace refresh.  ",
  serviceId: "",
  website: "",
};

beforeEach(() => {
  leads.length = 0;
  vi.clearAllMocks();
});

describe("public enquiry creation", () => {
  it("accepts required fields without an account or optional details", async () => {
    await expect(createPublicEnquiry(valid, repository)).resolves.toEqual({ status: "success" });
    expect(leads).toEqual([{
      name: "Ada Example", email: "ada@example.test", phone: null, company: null,
      message: "Please help us plan a workspace refresh.", serviceId: null,
    }]);
  });

  it("associates a published service and normalizes optional text", async () => {
    const result = await createPublicEnquiry({ ...valid, phone: "  +234 800 000 0000 ", company: "  Example Co  ", serviceId: publishedId }, repository);
    expect(result).toEqual({ status: "success" });
    expect(leads[0]).toMatchObject({ phone: "+234 800 000 0000", company: "Example Co", serviceId: publishedId });
  });

  it("rejects malformed, missing, and unpublished service IDs", async () => {
    for (const serviceId of ["not-a-uuid", randomUUID(), unpublishedId]) {
      const result = await createPublicEnquiry({ ...valid, serviceId }, repository);
      expect(result).toEqual({ status: "invalid", fieldErrors: { serviceId: "Choose an available service." } });
    }
    expect(leads).toHaveLength(0);
  });

  it("rejects malformed email and empty required fields", async () => {
    const result = await createPublicEnquiry({ ...valid, name: " ", email: "no-at-sign", message: " " }, repository);
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.fieldErrors).toHaveProperty("name");
      expect(result.fieldErrors).toHaveProperty("email");
      expect(result.fieldErrors).toHaveProperty("message");
    }
    expect(leads).toHaveLength(0);
  });

  it("rejects oversized inputs", async () => {
    for (const changed of [{ name: "x".repeat(121) }, { email: `${"x".repeat(250)}@example.test` }, { phone: "1".repeat(41) }, { company: "x".repeat(121) }, { message: "x".repeat(3001) }]) {
      const result = await createPublicEnquiry({ ...valid, ...changed }, repository);
      expect(result.status).toBe("invalid");
    }
    expect(leads).toHaveLength(0);
  });

  it("silently discards a filled honeypot without creating a Lead", async () => {
    await expect(createPublicEnquiry({ ...valid, website: "https://spam.example" }, repository)).resolves.toEqual({ status: "success" });
    expect(leads).toHaveLength(0);
  });
});
