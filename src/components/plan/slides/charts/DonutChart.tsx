import type { Segment } from '@/lib/slides/deck';
import { color, pick } from './scale';

export function DonutChart({ segments, accent, ramp }: { segments: Segment[]; accent: string; ramp: string[] }) {
  const W = 800, H = 380, cx = 200, cy = H / 2, r = 130, thick = 46;
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  let angle = -Math.PI / 2;
  const arc = (frac: number) => {
    const a0 = angle, a1 = angle + frac * Math.PI * 2; angle = a1;
    const p = (a: number, rad: number) => `${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${p(a0, r)} A ${r} ${r} 0 ${large} 1 ${p(a1, r)} L ${p(a1, r - thick)} A ${r - thick} ${r - thick} 0 ${large} 0 ${p(a0, r - thick)} Z`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Donut chart: ${segments.map((s) => s.label).join(', ')}`}>
      {segments.map((s, i) => <path key={i} d={arc(s.value / total)} fill={pick(ramp, i, accent)} />)}
      {segments.map((s, i) => (
        <g key={i} transform={`translate(${W / 2 + 40}, ${cy - segments.length * 14 + i * 28})`}>
          <rect width={14} height={14} rx={3} fill={pick(ramp, i, accent)} />
          <text x={22} y={12} fontSize={15} fill="currentColor">{s.label} · {Math.round((s.value / total) * 100)}%</text>
        </g>
      ))}
    </svg>
  );
}
