/**
 * Inline stroke icons (Lucide-style geometry, 2px stroke, currentColor).
 * Pure SVG — safe to render in both Server and Client Components. Replaces
 * Unicode arrow glyphs so weight/animation/theming stay consistent across
 * fonts and platforms. Always decorative here, so `aria-hidden` is fixed on.
 */

type IconProps = { className?: string; size?: number };

export function ArrowRight({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft({ className, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
