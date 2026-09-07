export type PlacedNode = { id: string; layer: number; row: number };

/**
 * Places a directed graph into columns by longest path from its roots.
 *
 * Longest path rather than shortest, so a node is always drawn to the right of
 * everything that reaches it. This page links straight to the Library *and* the
 * Library feeds the AI Company — shortest path would put those two in the same
 * column and draw a backwards-looking arrow between them.
 *
 * The iteration cap keeps a future cycle from hanging the render.
 *
 * Mirrors `layoutGraph` in the private tools.nanoteofficial.me repo.
 */
export function layoutGraph(
  nodes: readonly string[],
  edges: readonly { from: string; to: string }[],
): PlacedNode[] {
  const layer = new Map<string, number>(nodes.map((n) => [n, 0]));

  for (let pass = 0; pass < nodes.length + 1; pass++) {
    let moved = false;
    for (const e of edges) {
      const from = layer.get(e.from);
      const to = layer.get(e.to);
      if (from === undefined || to === undefined) continue;
      if (to < from + 1) {
        layer.set(e.to, from + 1);
        moved = true;
      }
    }
    if (!moved) break;
  }

  const rowCounter = new Map<number, number>();
  return nodes.map((id) => {
    const l = layer.get(id) ?? 0;
    const row = rowCounter.get(l) ?? 0;
    rowCounter.set(l, row + 1);
    return { id, layer: l, row };
  });
}
