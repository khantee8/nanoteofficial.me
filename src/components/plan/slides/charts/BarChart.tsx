import type { ChartSeries } from '@/lib/slides/deck';
import { niceMax, color, pick } from './scale';

export function BarChart({ categories, series, accent, ramp }: {
  categories: string[]; series: ChartSeries[]; accent: string; ramp: string[];
}) {
  const W = 800, H = 380, padL = 48, padB = 40, padT = 16, padR = 16;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const iw = W - padL - padR, ih = H - padT - padB;
  const groupW = iw / categories.length;
  const barW = (groupW * 0.7) / series.length;
  const y = (v: number) => padT + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart: ${series.map((s) => s.name).join(', ')}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}><line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" opacity={0.12} />
          <text x={padL - 6} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>{Math.round(max * f)}</text></g>
      ))}
      {categories.map((cat, ci) => (
        <g key={ci}>
          {series.map((s, si) => {
            const x = padL + ci * groupW + groupW * 0.15 + si * barW;
            const h = (s.values[ci] / max) * ih;
            return <rect key={si} x={x} y={padT + ih - h} width={barW - 2} height={h} fill={series.length > 1 ? pick(ramp, si, accent) : color(accent)} rx={2} />;
          })}
          <text x={padL + ci * groupW + groupW / 2} y={H - padB + 16} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>{cat}</text>
        </g>
      ))}
    </svg>
  );
}
