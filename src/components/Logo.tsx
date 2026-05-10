import Link from "next/link";

/**
 * Logo mark — a rounded square frame containing a lowercase "n"
 * with a brand-accented dot. The dot color follows --feature-color
 * so the mark wears the active feature's identity.
 *
 * The "n" is two strokes: a vertical stem and an arch. Together with
 * the dot they form the wordmark "n." — short for "nanote".
 */
export function LogoMark({
  size = 32,
  showFrame = true,
}: {
  size?: number;
  showFrame?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {showFrame && (
        <>
          <rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="10"
            fill="var(--surface)"
          />
          <rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="10"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <rect
            x="1"
            y="1"
            width="38"
            height="2.5"
            rx="1.25"
            style={{ fill: "var(--feature-color)" }}
          />
        </>
      )}
      <path
        d="M11 28V16.5c0-.55.22-1.08.61-1.47.39-.39.92-.61 1.47-.61h.84c.55 0 1.08.22 1.47.61.39.39.61.92.61 1.47V28"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 19.6c0-1.41.56-2.76 1.55-3.76a5.32 5.32 0 0 1 7.52 0 5.32 5.32 0 0 1 1.55 3.76V28"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="28" r="2.6" style={{ fill: "var(--feature-color)" }} />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 font-semibold tracking-tight"
      aria-label="nanoteofficial home"
    >
      <LogoMark size={32} />
      <span className="leading-none hidden sm:inline">
        nanote<span style={{ color: "var(--feature-color)" }}>official</span>
        <span className="text-[var(--muted-soft)] font-normal">.me</span>
      </span>
    </Link>
  );
}
