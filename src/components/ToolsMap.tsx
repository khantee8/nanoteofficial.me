"use client";

import { useState } from "react";
import { estWidth, fitLabel } from "@/lib/fitText";

export type ToolMapNode = {
  id: string;
  label: string;
  sub: string;
  layer: number;
  row: number;
  accent: string;
  dashed?: boolean;
  isPrivate: boolean;
  href?: string;
  /** Clicking drills into this node in place rather than navigating away. */
  drillable?: boolean;
};

export type ToolMapEdge = { from: string; to: string; label: string };

const COL_W = 234;
const ROW_H = 100;
const NODE_W = 178;
const PAD = 20;
const TEXT_X = 16;
const LABEL_BASE = 13.5;
/** Right-hand gutter: the lock badge lives here on private nodes. */
const TEXT_AVAIL = NODE_W - TEXT_X - 26;

export function ToolsMap({
  nodes,
  edges,
  label,
  onSelect,
}: {
  nodes: ToolMapNode[];
  edges: ToolMapEdge[];
  label: string;
  /** Supplied when a node can be drilled into without leaving the page. */
  onSelect?: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  // Drilling stays on the page — no navigation, no new tab.
  const activate = (n: ToolMapNode) => {
    if (n.drillable && onSelect) return onSelect(n.id);
    if (n.href) window.open(n.href, "_blank", "noopener,noreferrer");
  };
  const isInteractive = (n: ToolMapNode) => Boolean((n.drillable && onSelect) || n.href);

  const fitted = new Map(nodes.map((n) => [n.id, fitLabel(n.label, TEXT_AVAIL, LABEL_BASE)]));
  const maxLines = Math.max(1, ...[...fitted.values()].map((f) => f.lines.length));
  const lineGap = LABEL_BASE + 2;
  const labelTop = 23;
  const subY = labelTop + (maxLines - 1) * lineGap + 19;
  const NODE_H = subY + 19;

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

  const EDGE_FONT = 11;

  /**
   * Places an edge label clear of the node boxes where it can.
   *
   * The natural spot — the midpoint of the connector — often sits on top of a
   * node, where the label collides with that node's own text. A label can also
   * be wider than the gap between two columns, in which case no vertical offset
   * clears it; rather than give up and overlap badly, every candidate is scored
   * by overlap area and the least-bad one wins. Offsets are ordered
   * nearest-first so a label only travels as far as it must.
   */
  const clearLabelY = (mid: number, baseY: number, text: string) => {
    const half = estWidth(text, EDGE_FONT) / 2 + 3;
    const boxes = nodes.map((n) => pos.get(n.id)!);
    const overlapArea = (y: number) =>
      boxes.reduce((sum, b) => {
        const ox = Math.min(mid + half, b.x + NODE_W) - Math.max(mid - half, b.x);
        const oy = Math.min(y + 3, b.y + NODE_H) - Math.max(y - 9, b.y);
        return sum + (ox > 0 && oy > 0 ? ox * oy : 0);
      }, 0);

    let best = baseY - 8;
    let bestScore = Infinity;
    for (const dy of [-8, -22, 8, -36, 22, -50, 36, -58, 50, -66, 62, -74]) {
      const score = overlapArea(baseY + dy);
      if (score === 0) return baseY + dy;
      if (score < bestScore) {
        bestScore = score;
        best = baseY + dy;
      }
    }
    return best;
  };

  // Geometry is computed once so connectors and their labels can be drawn in
  // two separate passes — see the label group below.
  const laid = edges.flatMap((e, i) => {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) return [];
    const x1 = a.x + NODE_W;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_H / 2;
    return [{ key: i, label: e.label, x1, y1, x2, y2, mid: (x1 + x2) / 2, on: touches(e) }];
  });
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
          {laid.map((l) => (
            <path
              key={l.key}
              d={`M ${l.x1} ${l.y1} C ${l.mid} ${l.y1}, ${l.mid} ${l.y2}, ${l.x2} ${l.y2}`}
              fill="none"
              stroke={active && l.on ? "var(--brand-accent)" : "var(--muted)"}
              strokeWidth={active && l.on ? 2 : 1.25}
              markerEnd="url(#tools-arrow)"
              opacity={l.on ? 1 : 0.12}
              style={{ transition: "opacity 150ms" }}
            />
          ))}
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
                  cursor: isInteractive(n) ? "pointer" : "default",
                }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
                tabIndex={isInteractive(n) ? 0 : -1}
                role={isInteractive(n) ? (n.drillable && onSelect ? "button" : "link") : undefined}
                aria-label={`${n.label} — ${n.sub}`}
                onClick={() => activate(n)}
                onKeyDown={(ev) => {
                  if (isInteractive(n) && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    activate(n);
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
                  strokeDasharray={n.dashed ? "4 3" : undefined}
                />
                <rect width={4} height={NODE_H} rx={2} fill={n.accent} />
                <text
                  x={TEXT_X}
                  y={labelTop}
                  className="fill-[var(--foreground)]"
                  style={{ fontSize: fitted.get(n.id)!.size, fontWeight: 600 }}
                >
                  {fitted.get(n.id)!.lines.map((line, i) => (
                    <tspan key={i} x={TEXT_X} dy={i === 0 ? 0 : lineGap}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <text x={TEXT_X} y={subY} className="fill-[var(--muted)]" style={{ fontSize: 11 }}>
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

        {/* Labels paint after the nodes. SVG has no z-index — painting order is
            document order — so drawing them alongside the connectors put them
            underneath the node boxes. The halo keeps a label legible where it
            crosses a connector. */}
        {active && (
          <g>
            {laid
              .filter((l) => l.on && l.label)
              .map((l) => (
                <text
                  key={l.key}
                  x={l.mid}
                  y={clearLabelY(l.mid, (l.y1 + l.y2) / 2, l.label)}
                  textAnchor="middle"
                  className="fill-[var(--muted)]"
                  stroke="var(--surface)"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  style={{ fontSize: EDGE_FONT, paintOrder: "stroke" }}
                >
                  {l.label}
                </text>
              ))}
          </g>
        )}
      </svg>
    </div>
  );
}
