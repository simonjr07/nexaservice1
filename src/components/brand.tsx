import Link from "next/link";

export function Brand({ inverse = false, businessName = "NexaService" }: { inverse?: boolean; businessName?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${businessName} home`}
      className={`inline-flex items-center gap-3 rounded-sm text-xl font-semibold tracking-[-0.05em] ${inverse ? "text-white" : "text-ink"}`}
    >
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 place-items-center rounded-xl text-lg font-bold tracking-[-0.1em] ${inverse ? "bg-accent text-deep" : "bg-deep text-accent"}`}
      >
        {businessName.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 max-w-[9rem] truncate sm:max-w-[18rem] lg:max-w-[22rem]" title={businessName}>
        {businessName === "NexaService" ? <>Nexa<span className={inverse ? "text-accent" : "text-sea"}>Service</span></> : businessName}
      </span>
    </Link>
  );
}
