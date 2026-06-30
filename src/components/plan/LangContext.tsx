"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { pt, type PlanKey } from "@/lib/plan/i18n";

type T = (key: PlanKey, vars?: Record<string, string | number>) => string;
const Ctx = createContext<{ lang: Lang; t: T }>({ lang: "en", t: (k) => k });

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: (k: PlanKey, vars?: Record<string, string | number>) => pt(lang, k, vars) }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlanT() {
  return useContext(Ctx);
}
