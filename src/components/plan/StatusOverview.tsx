import { STATUS_LABELS } from "@/lib/plan/types";
import type { StatusCount } from "@/lib/plan/types";

export function StatusOverview({ counts }: { counts: StatusCount }) {
  const keys = Object.keys(STATUS_LABELS) as (keyof StatusCount)[];
  return (
    <div className="mb-4 flex gap-4">
      {keys.map((k) => (
        <div key={k} className="rounded-md border border-black/10 px-3 py-2 text-center dark:border-white/10">
          <div className="text-lg font-semibold">{counts[k]}</div>
          <div className="text-xs opacity-60">{STATUS_LABELS[k]}</div>
        </div>
      ))}
    </div>
  );
}
