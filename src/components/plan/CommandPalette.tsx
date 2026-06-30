"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanT } from "./LangContext";
import { typeKey } from "@/lib/plan/i18n";

type Item = { id: string; label: string; sub?: string; href: string };

export function CommandPalette({ projects }: { projects: { id: string; name: string; type: string }[] }) {
  const router = useRouter();
  const { t } = usePlanT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const base: Item[] = [
      { id: "overview", label: t("cmd.overview"), sub: t("cmd.overviewSub"), href: "/plan" },
      ...projects.map((p) => ({ id: p.id, label: p.name, sub: t(typeKey(p.type)), href: `/plan/${p.id}` })),
    ];
    const needle = q.trim().toLowerCase();
    return needle ? base.filter((i) => i.label.toLowerCase().includes(needle) || i.sub?.toLowerCase().includes(needle)) : base;
  }, [projects, q, t]);

  const close = () => { setOpen(false); setQ(""); setActive(0); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        if (open) { setQ(""); setActive(0); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input when the palette opens (no state changes here).
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  if (!open) return null;
  const safeActive = Math.min(active, Math.max(0, items.length - 1));
  const go = (item?: Item) => { if (!item) return; close(); router.push(item.href); };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Command palette">
      <button aria-label="Close" onClick={close} className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div className="absolute left-1/2 top-24 w-[min(90vw,32rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); go(items[safeActive]); }
            else if (e.key === "Escape") close();
          }}
          placeholder={t("cmd.placeholder")}
          className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--muted-soft)]"
        />
        <ul className="max-h-72 overflow-y-auto p-1">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-[var(--muted-soft)]">{t("cmd.noMatch")}</li>}
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  i === safeActive ? "bg-[var(--surface-2)]" : ""
                }`}>
                <span className="font-medium">{item.label}</span>
                {item.sub && <span className="text-xs uppercase tracking-wide text-[var(--muted-soft)]">{item.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted-soft)]">
          {t("cmd.hint")}
        </div>
      </div>
    </div>
  );
}
