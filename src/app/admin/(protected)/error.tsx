"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-line bg-white p-8">
      <h1 className="text-2xl font-semibold">Workspace page unavailable</h1>
      <p className="mt-3 text-sm text-muted">This page could not be loaded right now. Please try again.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-full bg-deep px-6 text-sm font-semibold text-white hover:bg-sea">Try again</button>
    </div>
  );
}
