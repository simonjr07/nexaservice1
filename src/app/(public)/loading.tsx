export default function PublicLoading() {
  return (
    <div role="status" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">NexaService</p>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Loading page…</p>
      <p className="mt-2 text-sm text-muted">Getting the latest information.</p>
    </div>
  );
}
