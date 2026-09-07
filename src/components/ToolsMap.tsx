"use client";

import { useState } from "react";

export type ToolMapNode = {
  id: string;
  label: string;
  sub: string;
  layer: number;
  row: number;
  accent: string;
  isPrivate: boolean;
  href?: string;
};

export type ToolMapEdge = { from: string; to: string; label: string };

const COL_W = 234;
const ROW_H = 100;
const NODE_W = 178;
const NODE_H = 64;
const PAD = 20;

export function ToolsMap({
  nodes,
  edges,
  label,
}: {
  nodes: ToolMapNode[];
  edges: ToolMapEdge[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const columns = Math.max(...nodes.map((n) => n.layer)) + 1;
  const perColumn = new Map<number, number>();
  for (const n of nodes) perColumn.set(n.layer, (perColumn.get(n.layer) ?? 0) + 1);
  const tallest = Math.max(...perColumn.values());

  // Centre each column vertically so short columns don't hug the top.
  const pos = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const count = perColumn.get(n.layer)!;
    pos.set(n.id, {
      x: PAD + n.layer * COL_W,
      y: PAD + ((tallest - count) * ROW_H) / 2 + n.row * ROW_H,
    });
  }

  const width = PAD * 2 + (columns - 1) * COL_W + NODE_W;
  // The last row occupies NODE_H, not a full ROW_H, so measuring by rows alone
  // would leave a band of dead space beneath the diagram.
  const height = PAD * 2 + (tallest - 1) * ROW_H + NODE_H;

  const touches = (e: ToolMapEdge) =>
    active === null || e.from === active || e.to === active;
  const lit = (id: string) =>
    active === null ||
    active === id ||
    edges.some(
      (e) => (e.from === active && e.to === id) || (e.to === active && e.from === id),
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
      {/* Scales down to fit the column so a wide graph stays legible at a
          glance; below the floor it scrolls instead of becoming unreadable. */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
        style={{ minWidth: Math.min(width, 560) }}
      >
        <defs>
          <marker
            id="tools-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>

        <g>
          {edges.map((e, i) => {
            const a = pos.get(e.from);
            const b = pos.get(e.to);
            if (!a || !b) return null;
            const x1 = a.x + NODE_W;
            const y1 = a.y + NODE_H / 2;
            const x2 = b.x;
            const y2 = b.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            const on = touches(e);
            return (
              <g key={i} opacity={on ? 1 : 0.12} style={{ transition: "opacity 150ms" }}>
                <path
                  d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={active && on ? "var(--brand-accent)" : "var(--muted)"}
                  strokeWidth={active && on ? 2 : 1.25}
                  markerEnd="url(#tools-arrow)"
                />
                {active && on && (
                  <text
                    x={mid}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    className="fill-[var(--muted)]"
                    style={{ fontSize: 11 }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g>
          {nodes.map((n) => {
            const p = pos.get(n.id)!;
            const on = lit(n.id);
            return (
              <g
                key={n.id}
                transform={`translate(${p.x} ${p.y})`}
                opacity={on ? 1 : 0.3}
                style={{
                  transition: "opacity 150ms",
                  cursor: n.href ? "pointer" : "default",
                }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
                tabIndex={n.href ? 0 : -1}
                role={n.href ? "link" : undefined}
                aria-label={`${n.label} — ${n.sub}`}
                onClick={() => {
                  if (n.href) window.open(n.href, "_blank", "noopener,noreferrer");
                }}
                onKeyDown={(ev) => {
                  if (n.href && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    window.open(n.href, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill="var(--background)"
                  stroke={active === n.id ? n.accent : "var(--border)"}
                  strokeWidth={active === n.id ? 2 : 1}
                />
                <rect width={4} height={NODE_H} rx={2} fill={n.accent} />
                <text
                  x={16}
                  y={26}
                  className="fill-[var(--foreground)]"
                  style={{ fontSize: 13.5, fontWeight: 600 }}
                >
                  {n.label}
                </text>
                <text x={16} y={45} className="fill-[var(--muted)]" style={{ fontSize: 11 }}>
                  {n.sub}
                </text>
                {n.isPrivate && (
                  <g transform={`translate(${NODE_W - 26} 13)`} aria-hidden>
                    <title>Private repository</title>
                    <path
                      d="M3.5 5V3.5a2.5 2.5 0 015 0V5M2.5 5h7v5h-7z"
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
