import type { Segment } from '@/lib/slides/deck';
import { pick } from './scale';

export function DonutChart({ segments, accent, ramp }: { segments: Segment[]; accent: string; ramp: string[] }) {
  const W = 800, H = 380, cx = 200, cy = H / 2, r = 130, thick = 46;
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  const p = (a: number, rad: number) => `${cx + Math.cos(a) * rad} ${cy + Math.sin(a) * rad}`;
  const arc = (a0: number, a1: number) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${p(a0, r)} A ${r} ${r} 0 ${large} 1 ${p(a1, r)} L ${p(a1, r - thick)} A ${r - thick} ${r - thick} 0 ${large} 0 ${p(a0, r - thick)} Z`;
  };
  // cumulative start angle per segment, computed without reassigning an outer variable during render
  const start = (i: number) => -Math.PI / 2 + (segments.slice(0, i).reduce((a, s) => a + s.value, 0) / total) * Math.PI * 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Donut chart: ${segments.map((s) => s.label).join(', ')}`}>
      {segments.map((s, i) => <path key={i} d={arc(start(i), start(i) + (s.value / total) * Math.PI * 2)} fill={pick(ramp, i, accent)} />)}
      {segments.map((s, i) => (
        <g key={i} transform={`translate(${W / 2 + 40}, ${cy - segments.length * 14 + i * 28})`}>
          <rect width={14} height={14} rx={3} fill={pick(ramp, i, accent)} />
          <text x={22} y={12} fontSize={15} fill="currentColor">{s.label} · {Math.round((s.value / total) * 100)}%</text>
        </g>
      ))}
    </svg>
  );
}
