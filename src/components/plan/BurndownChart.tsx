import type { Burndown } from "@/lib/plan/burndown";

const W = 720, H = 280;
const PAD = { l: 44, r: 16, t: 16, b: 30 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

export function BurndownChart({ data }: { data: Burndown }) {
  if (data.points.length < 2 || data.total <= 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted-soft)]">
        Not enough task history yet to chart a burndown. Add tasks (with estimates
        for an hours-based chart) and complete a few to see the trend.
      </div>
    );
  }

  const n = data.points.length;
  const maxY = Math.max(data.total, ...data.points.map((p) => p.remaining));
  const x = (i: number) => PAD.l + (plotW * i) / (n - 1);
  const y = (v: number) => PAD.t + plotH * (1 - v / maxY);
  const line = (key: "remaining" | "ideal") =>
    data.points.map((p, i) => `${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

  const unitLabel = data.unit === "hours" ? "hours" : "tasks";
  const first = data.points[0].date;
  const last = data.points[n - 1].date;

  return (
    <figure className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <figcaption className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium tracking-tight">Burndown ({unitLabel})</span>
        <span className="flex gap-3 text-xs text-[var(--muted-soft)]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ background: "var(--feature-color)" }} />
            remaining
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-current" />
            ideal
          </span>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`Burndown chart, ${maxY} ${unitLabel} at start trending to zero`}>
        {/* axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} className="stroke-current opacity-20" />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} className="stroke-current opacity-20" />
        {/* y labels */}
        <text x={PAD.l - 6} y={PAD.t + 4} textAnchor="end" className="fill-current text-[10px] opacity-50">{round(maxY)}</text>
        <text x={PAD.l - 6} y={H - PAD.b} textAnchor="end" className="fill-current text-[10px] opacity-50">0</text>
        {/* x labels */}
        <text x={PAD.l} y={H - PAD.b + 16} textAnchor="start" className="fill-current text-[10px] opacity-50">{first}</text>
        <text x={W - PAD.r} y={H - PAD.b + 16} textAnchor="end" className="fill-current text-[10px] opacity-50">{last}</text>
        {/* ideal */}
        <polyline points={line("ideal")} fill="none" className="stroke-current opacity-40" strokeWidth={1.5} strokeDasharray="4 4" />
        {/* actual remaining */}
        <polyline points={line("remaining")} fill="none" strokeWidth={2}
          style={{ stroke: "var(--feature-color)" }} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </figure>
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
