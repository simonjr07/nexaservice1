import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/dashboard/login-form";
import { getCurrentUser } from "@/server/auth/authorization";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: "Sign in to the NexaService staff workspace.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getCurrentUser()) redirect("/admin");

  return (
    <main className="grid min-h-screen bg-[#f2f5f2] text-ink lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-deep px-6 py-8 text-white sm:px-10 lg:px-16 lg:py-12">
        <Brand inverse />
        <div className="max-w-lg py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">NexaService workspace</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Good work starts behind the scenes.</h1>
          <p className="mt-6 text-base leading-8 text-white/70">A private space for the team to manage enquiries and keep the business moving.</p>
        </div>
        <Link href="/" className="w-fit rounded-full text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Return to public site ↗</Link>
      </section>
      <section className="flex items-center justify-center px-5 py-14 sm:px-10 lg:px-16" aria-label="Staff sign in">
        <div className="w-full max-w-md rounded-4xl border border-line bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Staff access</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tighter">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Use your staff email and password to continue.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
