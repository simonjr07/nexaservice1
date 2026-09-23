import { z } from "zod";

const optionalText = (max: number) => z.preprocess(
  (value) => value === null || typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).max(max).optional(),
);

const missingAsEmpty = (value: unknown) => value === null ? "" : value;

export const enquirySchema = z.object({
  name: z.preprocess(missingAsEmpty, z.string().trim().min(2, "Enter your name (at least 2 characters).").max(120, "Name is too long.")),
  email: z.preprocess(missingAsEmpty, z.string().trim().toLowerCase().max(254, "Email is too long.").email("Enter a valid email address.")),
  phone: z.preprocess(
    (value) => value === null || typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(7, "Enter a valid phone number.").max(40, "Phone number is too long.").optional(),
  ),
  company: optionalText(120),
  message: z.preprocess(missingAsEmpty, z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(3000, "Message is too long.")),
  serviceId: z.preprocess(
    (value) => value === null || typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().uuid("Choose an available service.").optional(),
  ),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof EnquiryInput;

export type EnquiryState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Partial<Record<EnquiryField, string>> }
  | { status: "success" }
  | { status: "error" };

export const initialEnquiryState: EnquiryState = { status: "idle" };
