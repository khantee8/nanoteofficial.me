import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="8"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      <path
        d="M8 22V13.6c0-.32.13-.62.36-.85a1.2 1.2 0 0 1 .85-.36h1.07c.32 0 .62.13.85.36.23.23.36.53.36.85V22M11.49 16.4c0-1.06.42-2.07 1.17-2.82a3.99 3.99 0 0 1 5.65 0c.75.75 1.17 1.76 1.17 2.82V22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="22" r="2.6" style={{ fill: "var(--feature-color)" }} />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-semibold tracking-tight"
      aria-label="nanoteofficial home"
    >
      <LogoMark size={26} />
      <span className="leading-none">
        nanoteofficial
        <span className="text-[var(--muted-soft)] font-normal">.me</span>
      </span>
    </Link>
  );
}
