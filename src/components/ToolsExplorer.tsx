"use client";

import { useCallback, useEffect, useState } from "react";
import { ToolsMap, type ToolMapEdge, type ToolMapNode } from "@/components/ToolsMap";

export type ToolView = {
  key: string;
  name: string;
  tagline: string;
  maturityLabel: string;
  maturityVar: string;
  repoLabel: string;
  nodes: ToolMapNode[];
  edges: ToolMapEdge[];
};

/**
 * Holds which tool the reader has drilled into.
 *
 * Drilling swaps the diagram in place: the platform view and every tool's
 * internals render through the same map, so moving between them costs no page
 * load and never opens a tab.
 */
export function ToolsExplorer({
  platformNodes,
  platformEdges,
  views,
  copy,
}: {
  platformNodes: ToolMapNode[];
  platformEdges: ToolMapEdge[];
  views: ToolView[];
  copy: { mapLabel: string; hint: string; drillHint: string; back: string };
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const current = views.find((v) => v.key === openKey) ?? null;

  const close = useCallback(() => setOpenKey(null), []);

  // Escape backs out — the drill-down has no browser Back to fall through to.
  useEffect(() => {
    if (!current) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, close]);

  return (
    <div>
      {current ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--foreground)]"
          >
            ← {copy.back}
          </button>
          <h3 className="text-xl font-semibold tracking-tight">{current.name}</h3>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: current.maturityVar, borderColor: current.maturityVar }}
          >
            {current.maturityLabel}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {current.repoLabel}
          </span>
        </div>
      ) : null}

      <ToolsMap
        nodes={current ? current.nodes : platformNodes}
        edges={current ? current.edges : platformEdges}
        label={current ? `${current.name} architecture diagram` : copy.mapLabel}
        onSelect={current ? undefined : setOpenKey}
      />

      <p className="mt-3 text-xs text-[var(--muted)]">
        {current ? current.tagline : copy.hint}
      </p>
      {current ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{copy.drillHint}</p>
      ) : null}
    </div>
  );
}
