import {
  tools,
  toolEdges,
  toolGraphs,
  pick,
  type ToolNodeKind,
} from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { layoutGraph } from "@/lib/graph-layout";
import { ToolsExplorer, type ToolView } from "@/components/ToolsExplorer";
import type { ToolMapEdge, ToolMapNode } from "@/components/ToolsMap";

const MATURITY_VAR = {
  production: "var(--tool-production)",
  minimal: "var(--tool-minimal)",
  shell: "var(--tool-shell)",
  planned: "var(--tool-planned)",
} as const;

/** Things outside my control are drawn dashed, whatever they are. */
const DASHED: ReadonlySet<ToolNodeKind> = new Set(["external", "job", "channel"]);

const KIND_ACCENT: Record<ToolNodeKind, string> = {
  app: "var(--brand-accent)",
  service: "var(--brand-accent)",
  datastore: "var(--tool-minimal)",
  external: "var(--muted)",
  job: "var(--tool-shell)",
  channel: "var(--tool-shell)",
};

export function Tools({ lang }: { lang: Lang }) {
  const order = ["portfolio", ...tools.map((tool) => tool.key)];
  const placed = layoutGraph(order, toolEdges);
  const at = (id: string) => placed.find((node) => node.id === id)!;

  const platformNodes: ToolMapNode[] = [
    {
      id: "portfolio",
      label: "Portfolio",
      sub: "nanoteofficial.me",
      layer: at("portfolio").layer,
      row: at("portfolio").row,
      accent: "var(--brand-accent)",
      isPrivate: false,
    },
    ...tools.map((tool) => ({
      id: tool.key,
      label: pick(tool.name, lang),
      sub: t(`tools.maturity.${tool.maturity}` as const, lang),
      layer: at(tool.key).layer,
      row: at(tool.key).row,
      accent: MATURITY_VAR[tool.maturity],
      // A planned tool has no graph behind it, so there is nothing to open.
      dashed: tool.maturity === "planned",
      isPrivate: tool.repoVisibility === "private",
      drillable: tool.maturity !== "planned",
    })),
  ];

  const planned = new Set(
    tools.filter((tool) => tool.maturity === "planned").map((tool) => tool.key),
  );

  const platformMapEdges: ToolMapEdge[] = toolEdges.map((edge) => ({
    from: edge.from,
    to: edge.to,
    label: pick(edge.label, lang),
    dashed: planned.has(edge.to),
  }));

  // `planned` tools have no graph, so they contribute no drill-in view.
  const withGraph = tools.filter((tool) => toolGraphs[tool.key]);

  const views: ToolView[] = withGraph.map((tool) => {
    const graph = toolGraphs[tool.key]!;
    const inner = layoutGraph(
      graph.nodes.map((node) => node.id),
      graph.edges,
    );
    const innerAt = (id: string) => inner.find((node) => node.id === id)!;

    return {
      key: tool.key,
      name: pick(tool.name, lang),
      tagline: pick(tool.tagline, lang),
      maturityLabel: t(`tools.maturity.${tool.maturity}` as const, lang),
      maturityVar: MATURITY_VAR[tool.maturity],
      repoLabel: t(`tools.repo.${tool.repoVisibility}` as const, lang),
      nodes: graph.nodes.map((node) => ({
        id: node.id,
        label: pick(node.label, lang),
        sub: t(`tools.kind.${node.kind}` as const, lang),
        layer: innerAt(node.id).layer,
        row: innerAt(node.id).row,
        accent: KIND_ACCENT[node.kind],
        dashed: DASHED.has(node.kind),
        isPrivate: false,
      })),
      edges: graph.edges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        label: pick(edge.label, lang),
      })),
    };
  });

  return (
    <>
      <ToolsExplorer
        platformNodes={platformNodes}
        platformEdges={platformMapEdges}
        views={views}
        copy={{
          mapLabel: t("tools.mapLabel", lang),
          hint: t("tools.hint", lang),
          drillHint: t("tools.drillHint", lang),
          back: t("tools.back", lang),
        }}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(["production", "minimal", "shell", "planned"] as const).map((m) => (
          <span
            key={m}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-sm text-[var(--muted)]"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: MATURITY_VAR[m] }}
            />
            {t(`tools.maturity.${m}` as const, lang)}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">{t("tools.footnote", lang)}</p>
        <a
          href="https://tools.nanoteofficial.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold transition-colors hover:brightness-110"
          style={{ color: "var(--brand-accent)" }}
        >
          {t("tools.seeAll", lang)}
        </a>
      </div>
    </>
  );
}
