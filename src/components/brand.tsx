import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="NexaService home"
      className={`inline-flex items-center gap-3 rounded-sm text-xl font-semibold tracking-[-0.05em] ${inverse ? "text-white" : "text-ink"}`}
    >
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 place-items-center rounded-xl text-lg font-bold tracking-[-0.1em] ${inverse ? "bg-accent text-deep" : "bg-deep text-accent"}`}
      >
        N
      </span>
      <span>
        Nexa<span className={inverse ? "text-accent" : "text-sea"}>Service</span>
      </span>
    </Link>
  );
}
