"use client";

import { useState, type FormEvent } from "react";
import type { Lang } from "@/lib/i18n";

const labels: Record<string, Record<Lang, string>> = {
  name: { en: "Name", th: "ชื่อ" },
  email: { en: "Email", th: "อีเมล" },
  message: { en: "Message", th: "ข้อความ" },
  send: { en: "Send message", th: "ส่งข้อความ" },
  sending: { en: "Sending…", th: "กำลังส่ง…" },
  success: {
    en: "Message sent — I'll reply within a day.",
    th: "ส่งข้อความแล้ว — ผมจะตอบกลับภายในหนึ่งวัน",
  },
  error: {
    en: "Something went wrong. Please try again or email directly.",
    th: "เกิดข้อผิดพลาด กรุณาลองใหม่หรือส่งอีเมลโดยตรง",
  },
};

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm({ lang }: { lang: Lang }) {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("company")) {
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          {labels.success[lang]}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--muted-soft)] mb-1.5">
            {labels.name[lang]}
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--muted-soft)] mb-1.5">
            {labels.email[lang]}
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            maxLength={320}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="block text-xs font-mono uppercase tracking-[0.14em] text-[var(--muted-soft)] mb-1.5">
          {labels.message[lang]}
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow resize-y"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{labels.error[lang]}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] text-white px-6 py-2.5 text-sm font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all disabled:opacity-60"
      >
        {status === "sending" ? labels.sending[lang] : labels.send[lang]}
      </button>
    </form>
  );
}
