export default function AdminLoading() {
  return <div role="status" className="rounded-2xl border border-line bg-white p-8" aria-live="polite">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">NexaService workspace</p>
    <h1 className="mt-3 text-2xl font-semibold">Loading workspace…</h1>
    <p className="mt-2 text-sm text-muted">Retrieving current information.</p>
  </div>;
}
