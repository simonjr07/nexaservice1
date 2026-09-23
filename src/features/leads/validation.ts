import { z } from "zod";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
export const leadStatusSchema = z.enum(LEAD_STATUSES);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const leadFiltersSchema = z.object({
  q: z.preprocess(blankToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(blankToUndefined, leadStatusSchema.optional()),
  serviceId: z.preprocess(blankToUndefined, z.uuid().optional()),
  page: z.preprocess(
    (value) => value === undefined ? 1 : typeof value === "string" ? Number(value) : value,
    z.number().int().min(1).max(1000),
  ),
});

export type LeadFilters = z.infer<typeof leadFiltersSchema>;
export const leadIdSchema = z.uuid();
export const leadNoteSchema = z.string().trim().min(2, "Write at least 2 characters.").max(2000, "Note is too long.");
export const assigneeSchema = z.union([z.uuid(), z.literal("")]);

export type LeadActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; message: string }
  | { status: "notFound" }
  | { status: "forbidden" }
  | { status: "error" };

export const initialLeadActionState: LeadActionState = { status: "idle" };
