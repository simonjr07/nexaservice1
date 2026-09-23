"use client";

import { useActionState } from "react";
import { initialTestimonialState, type ContentActionState, type TestimonialField } from "@/features/website-content/validation";

export function TestimonialPublicationForm({ published, action }: {
  published: boolean;
  action: (state: ContentActionState<TestimonialField>) => Promise<ContentActionState<TestimonialField>>;
}) {
  const [state, formAction, pending] = useActionState(action, initialTestimonialState);
  return <form action={formAction} className="flex items-center gap-3"><button type="submit" disabled={pending} className="min-h-10 rounded-full border border-sea px-4 text-xs font-semibold text-sea hover:bg-sea hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60">{pending ? "Saving…" : published ? "Unpublish" : "Publish"}</button>{state.status === "error" && <span role="alert" className="text-xs text-red-800">Could not update.</span>}{state.status === "notFound" && <span role="alert" className="text-xs text-red-800">Not found.</span>}</form>;
}
