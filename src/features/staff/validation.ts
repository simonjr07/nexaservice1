import { z } from "zod";

const name = z.string().trim().min(1, "Enter a name.").max(120, "Name must be 120 characters or fewer.");
const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254, "Email must be 254 characters or fewer.");
const role = z.enum(["ADMIN", "STAFF"]);

export const staffIdSchema = z.uuid();
export const accountStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export const createStaffSchema = z.object({
  name, email, role,
  password: z.string().min(12, "Password must be at least 12 characters.")
    .max(128, "Password is too long.")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be 72 UTF-8 bytes or fewer."),
});
export const editStaffSchema = z.object({ name, email, role });

export type StaffField = "name" | "email" | "role" | "password" | "status";
export type StaffActionState = {
  status: "idle" | "success" | "invalid" | "duplicate" | "notFound" | "self" | "lastAdmin" | "forbidden" | "error";
  fieldErrors?: Partial<Record<StaffField, string>>;
  id?: string;
};
export const initialStaffActionState: StaffActionState = { status: "idle" };
