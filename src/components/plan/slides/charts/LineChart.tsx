import type { ChartSeries } from '@/lib/slides/deck';
import { niceMax, color, pick } from './scale';

export function LineChart({ categories, series, accent, ramp }: {
  categories: string[]; series: ChartSeries[]; accent: string; ramp: string[];
}) {
  const W = 800, H = 380, padL = 48, padB = 40, padT = 16, padR = 16;
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = (i: number) => padL + (categories.length === 1 ? iw / 2 : (i / (categories.length - 1)) * iw);
  const y = (v: number) => padT + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Line chart: ${series.map((s) => s.name).join(', ')}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}><line x1={padL} x2={W - padR} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" opacity={0.12} />
          <text x={padL - 6} y={y(max * f) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>{Math.round(max * f)}</text></g>
      ))}
      {series.map((s, si) => (
        <polyline key={si} fill="none" strokeWidth={3} stroke={series.length > 1 ? pick(ramp, si, accent) : color(accent)}
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
      ))}
      {categories.map((cat, i) => (
        <text key={i} x={x(i)} y={H - padB + 16} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>{cat}</text>
      ))}
    </svg>
  );
}
