export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}
export const color = (hex: string) => (hex.startsWith('#') ? hex : `#${hex}`);
export const pick = (ramp: string[], i: number, fallback: string) => color(ramp[i % ramp.length] ?? fallback);
