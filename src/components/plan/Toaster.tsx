"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tone = "success" | "error" | "info";
type ToastAction = { label: string; onClick: () => void };
type Toast = { id: number; msg: string; tone: Tone; action?: ToastAction };

type ToastFn = (msg: string, opts?: { tone?: Tone; action?: ToastAction }) => void;

const ToastCtx = createContext<ToastFn>(() => {});
export function useToast(): ToastFn {
  return useContext(ToastCtx);
}

const TONE: Record<Tone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
};

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<ToastFn>((msg, opts) => {
    const id = Date.now() + Math.random();
    const tone = opts?.tone ?? "info";
    setToasts((t) => [...t, { id, msg, tone, action: opts?.action }]);
    const ttl = opts?.action ? 6000 : 3500;
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border px-4 py-2.5 text-sm shadow-md backdrop-blur ${TONE[t.tone]}`}>
            <span className="flex-1">{t.msg}</span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                className="shrink-0 font-medium underline underline-offset-2">
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
