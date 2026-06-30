"use client";
import { useState } from "react";
import type { Task } from "@/lib/db/schema";
import type { Lang } from "@/lib/i18n";
import { btnSecondary } from "./ui";
import { dueState } from "@/lib/plan/dates";

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

export function CalendarView({ tasks, lang }: { tasks: Task[]; lang: Lang }) {
  const locale = lang === "th" ? "th-TH" : "en-US";
  const wd = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2023, 0, 1 + i)));
  const now = new Date();
  const todayKey = iso(now);
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} className={btnSecondary} aria-label="Previous month">←</button>
        <span className="font-medium tracking-tight">{new Date(ym.y, ym.m).toLocaleString(locale, { month: "long", year: "numeric" })}</span>
        <button onClick={() => shift(1)} className={btnSecondary} aria-label="Next month">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {wd.map((d) => <div key={d} className="pb-1 text-center font-medium text-[var(--muted-soft)]">{d}</div>)}
        {cells.map((c, i) => {
          const key = c ? iso(c) : "";
          const isToday = key === todayKey;
          return (
            <div key={i}
              className={`min-h-24 rounded-lg border p-1.5 ${
                c ? "border-[var(--border-soft)] bg-[var(--background)]" : "border-transparent"
              } ${isToday ? "ring-1 ring-[var(--feature-color)]" : ""}`}>
              {c && <>
                <div className={`mb-1 text-right text-[11px] tabular-nums ${isToday ? "font-semibold text-[var(--feature-color)]" : "text-[var(--muted-soft)]"}`}>
                  {c.getDate()}
                </div>
                <div className="space-y-0.5">
                  {(byDay.get(key) ?? []).map((t) => {
                    const overdue = dueState(t) === "overdue";
                    return (
                      <div key={t.id} title={t.title}
                        className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={overdue ? {
                          background: "color-mix(in srgb, #f43f5e 16%, transparent)",
                          color: "#e11d48",
                        } : {
                          background: "color-mix(in srgb, var(--feature-color) 14%, transparent)",
                          color: "var(--feature-color)",
                        }}>
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              </>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
