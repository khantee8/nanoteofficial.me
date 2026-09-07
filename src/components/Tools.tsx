import { tools, toolEdges, pick } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { layoutGraph } from "@/lib/graph-layout";
import { ToolsMap, type ToolMapEdge, type ToolMapNode } from "@/components/ToolsMap";

const MATURITY_VAR = {
  production: "var(--tool-production)",
  minimal: "var(--tool-minimal)",
  shell: "var(--tool-shell)",
} as const;

export function Tools({ lang }: { lang: Lang }) {
  const order = ["portfolio", ...tools.map((t) => t.key)];
  const placed = layoutGraph(order, toolEdges);
  const at = (id: string) => placed.find((n) => n.id === id)!;

  const nodes: ToolMapNode[] = [
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
      isPrivate: tool.repoVisibility === "private",
      href: tool.href,
    })),
  ];

  const edges: ToolMapEdge[] = toolEdges.map((e) => ({
    from: e.from,
    to: e.to,
    label: pick(e.label, lang),
  }));

  return (
    <>
      <ToolsMap nodes={nodes} edges={edges} label={t("tools.mapLabel", lang)} />

      <p className="mt-3 text-xs text-[var(--muted)]">{t("tools.hint", lang)}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(["production", "minimal", "shell"] as const).map((m) => (
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
