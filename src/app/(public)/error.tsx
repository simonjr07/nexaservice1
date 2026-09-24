"use client";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <div className="max-w-2xl rounded-3xl border border-line bg-white p-8 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">This page is unavailable right now.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Please try again in a moment.</p>
        <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea">Try again</button>
      </div>
    </section>
  );
}
