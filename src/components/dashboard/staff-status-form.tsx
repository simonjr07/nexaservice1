"use client";

import { useActionState } from "react";
import type { StaffActionState } from "@/features/staff/validation";

const initialStaffActionState: StaffActionState = { status: "idle" };

export function StaffStatusForm({ name, status, self, action }: {
  name: string;
  status: "ACTIVE" | "DISABLED";
  self: boolean;
  action: (state: StaffActionState) => Promise<StaffActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialStaffActionState);
  const disabling = status === "ACTIVE";
  return <form action={formAction}>
    <button type="submit" disabled={pending || (self && disabling)} aria-label={`${disabling ? "Disable" : "Reactivate"} ${name}`} className="text-sm font-semibold text-sea underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:cursor-not-allowed disabled:text-muted">{pending ? "Saving…" : disabling ? "Disable" : "Reactivate"}</button>
    {self && disabling && <span className="ml-2 text-xs text-muted">Your account</span>}
    {state.status === "success" && <p role="status" className="mt-2 text-xs text-sea">Account status updated.</p>}
    {state.status === "self" && <p role="alert" className="mt-2 text-xs text-red-800">You cannot disable your own account.</p>}
    {state.status === "lastAdmin" && <p role="alert" className="mt-2 text-xs text-red-800">The last active administrator cannot be disabled.</p>}
    {state.status === "invalid" && <p role="alert" className="mt-2 text-xs text-red-800">Invalid account status.</p>}
    {state.status === "notFound" && <p role="alert" className="mt-2 text-xs text-red-800">Account not found.</p>}
    {(state.status === "error" || state.status === "forbidden") && <p role="alert" className="mt-2 text-xs text-red-800">The change could not be saved.</p>}
  </form>;
}
