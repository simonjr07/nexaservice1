"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await signOut({ callbackUrl: "/admin/login" });
        } catch {
          setPending(false);
        }
      }}
      className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-sea hover:text-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
