import Link from "next/link";

export function Brand({ inverse = false, businessName = "NexaService" }: { inverse?: boolean; businessName?: string }) {
  const branded = businessName.startsWith("NexaService");
  return (
    <Link
      href="/"
      aria-label={`${businessName} home`}
      className={`inline-flex items-center gap-3 rounded-sm text-xl font-semibold tracking-[-0.05em] ${inverse ? "text-white" : "text-ink"}`}
    >
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${inverse ? "bg-accent text-deep" : "bg-deep text-accent"}`}
      >
        <svg viewBox="0 0 64 64" className="h-6 w-6" focusable="false">
          <path d="M16 46V18h7l18 19V18h7v28h-7L23 27v19z" fill="currentColor" />
        </svg>
      </span>
      <span className="min-w-0 max-w-[9rem] truncate sm:max-w-[18rem] lg:max-w-[22rem]" title={businessName}>
        {branded ? <>Nexa<span className={inverse ? "text-accent" : "text-sea"}>Service</span><span className="hidden sm:inline">{businessName.slice("NexaService".length)}</span></> : businessName}
      </span>
    </Link>
  );
}
