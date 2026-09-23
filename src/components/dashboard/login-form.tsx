"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      });
      if (!result?.ok || result.error) {
        setError("Unable to sign in with those credentials.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="staff-email" className="block text-sm font-semibold text-ink">Email</label>
        <input id="staff-email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={pending} className="mt-2 min-h-12 w-full rounded-xl border border-line px-4 text-ink outline-none transition-colors focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60" />
      </div>
      <div>
        <label htmlFor="staff-password" className="block text-sm font-semibold text-ink">Password</label>
        <input id="staff-password" name="password" type="password" autoComplete="current-password" required disabled={pending} className="mt-2 min-h-12 w-full rounded-xl border border-line px-4 text-ink outline-none transition-colors focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60" />
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:cursor-wait disabled:opacity-65">
        {pending ? "Signing in…" : "Sign in to workspace"}
      </button>
    </form>
  );
}
