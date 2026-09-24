"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={handleSubmit} aria-busy={pending} className="mt-8 space-y-5">
      <div>
        <label htmlFor="staff-email" className="block text-sm font-semibold text-ink">Email</label>
        <div className="relative mt-2">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <input id="staff-email" name="email" type="email" autoComplete="username" autoCapitalize="none" required maxLength={254} disabled={pending} aria-describedby={error ? "login-error" : undefined} className="min-h-12 w-full rounded-xl border border-line py-3 pl-12 pr-4 text-ink outline-none transition-colors focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label htmlFor="staff-password" className="block text-sm font-semibold text-ink">Password</label>
        <div className="relative mt-2">
          <input id="staff-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={pending} aria-describedby={error ? "login-error" : undefined} className="min-h-12 w-full rounded-xl border border-line py-3 pl-4 pr-14 text-ink outline-none transition-colors focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 disabled:opacity-60" />
          <button type="button" aria-controls="staff-password" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-[#f2f5f2] hover:text-sea focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sea">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="m3 3 18 18" />}
            </svg>
          </button>
        </div>
      </div>
      {error && <p id="login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-full bg-deep px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea disabled:cursor-wait disabled:opacity-65">
        {pending ? "Signing in…" : "Sign in to workspace"}
      </button>
    </form>
  );
}
