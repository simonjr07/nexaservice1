"use client";

import { useActionState } from "react";
import { initialServiceActionState, type ServiceActionState } from "@/features/services/validation";

export function ServicePublicationForm({ published, action }: {
  published: boolean;
  action: (state: ServiceActionState) => Promise<ServiceActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialServiceActionState);
  return <form action={formAction} className="flex flex-wrap items-center gap-3">
    <button type="submit" disabled={pending} className="min-h-10 rounded-full border border-sea px-4 text-xs font-semibold text-sea hover:bg-sea hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : published ? "Unpublish" : "Publish"}</button>
    {state.status === "success" && <span role="status" className="text-xs text-sea">Publication updated.</span>}
    {state.status === "error" && <span role="alert" className="text-xs text-red-800">Could not update.</span>}
    {state.status === "notFound" && <span role="alert" className="text-xs text-red-800">Service not found.</span>}
  </form>;
}
