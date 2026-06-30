"use client";
import { useState } from "react";
import type { Task } from "@/lib/db/schema";

function monthMatrix(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const start = first.getDay(); // 0=Sun
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const cells = monthMatrix(ym.y, ym.m);
  const byDay = new Map<string, Task[]>();
  for (const t of tasks) if (t.dueDate) {
    const k = t.dueDate.slice(0, 10);
    byDay.set(k, [...(byDay.get(k) ?? []), t]);
  }
  const shift = (delta: number) => setYm(({ y, m }) => {
    const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() };
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="text-sm underline">← Prev</button>
        <span className="font-medium">{new Date(ym.y, ym.m).toLocaleString("en", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shift(1)} className="text-sm underline">Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-px text-xs">
        {WD.map((d) => <div key={d} className="p-1 text-center opacity-60">{d}</div>)}
        {cells.map((c, i) => (
          <div key={i} className="min-h-20 border border-black/5 p-1 dark:border-white/5">
            {c && <>
              <div className="opacity-50">{c.getDate()}</div>
              {(byDay.get(iso(c)) ?? []).map((t) => (
                <div key={t.id} className="mt-0.5 truncate rounded bg-[var(--feature-color)]/15 px-1 text-[10px]">{t.title}</div>
              ))}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}
