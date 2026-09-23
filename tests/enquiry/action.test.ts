import { beforeEach, describe, expect, it, vi } from "vitest";

const { createLead } = vi.hoisted(() => ({ createLead: vi.fn() }));

vi.mock("@/server/db/repositories/lead-intake", () => ({
  leadIntakeRepository: {
    listPublishedServices: async () => [],
    isPublishedService: async () => false,
    createLead,
  },
}));

import { submitEnquiry } from "@/app/(public)/contact/actions";
import { initialEnquiryState } from "@/features/enquiry/validation";

function formData() {
  const data = new FormData();
  data.set("name", "Visitor Example");
  data.set("email", "VISITOR@EXAMPLE.TEST");
  data.set("message", "I would like to discuss a project.");
  return data;
}

beforeEach(() => {
  createLead.mockReset();
  createLead.mockResolvedValue(undefined);
});

describe("public enquiry Server Action", () => {
  it("needs no authentication and exposes no Lead record fields", async () => {
    const response = await submitEnquiry(initialEnquiryState, formData());
    expect(response).toEqual({ status: "success" });
    expect(JSON.stringify(response)).not.toMatch(/assignedUserId|passwordHash|leadId|email/i);
    expect(createLead).toHaveBeenCalledOnce();
  });

  it("returns a generic error when persistence fails", async () => {
    createLead.mockRejectedValue(new Error("database detail must stay private"));
    await expect(submitEnquiry(initialEnquiryState, formData())).resolves.toEqual({ status: "error" });
  });

  it("reports required fields when a direct request omits them", async () => {
    const response = await submitEnquiry(initialEnquiryState, new FormData());
    expect(response.status).toBe("invalid");
    if (response.status === "invalid") {
      expect(response.fieldErrors).toHaveProperty("name");
      expect(response.fieldErrors).toHaveProperty("email");
      expect(response.fieldErrors).toHaveProperty("message");
    }
    expect(createLead).not.toHaveBeenCalled();
  });
});
