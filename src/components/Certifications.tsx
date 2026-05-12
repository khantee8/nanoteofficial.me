import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

const CERT_META: Record<string, { vendor: string; color: string; category: string }> = {
  "CISSP":    { vendor: "ISC²",        color: "#009CDE", category: "Cybersecurity" },
  "CEH":      { vendor: "EC-Council",  color: "#B91C1C", category: "Ethical Hacking" },
  "CCNP-Enterprise": { vendor: "Cisco", color: "#049FD9", category: "Enterprise Network" },
  "CCNP-Security":   { vendor: "Cisco", color: "#049FD9", category: "Network Security" },
  "Fortinet FCP":    { vendor: "Fortinet", color: "#EE3124", category: "Network Security" },
  "PCNSE":    { vendor: "Palo Alto",   color: "#FA582D", category: "Firewall" },
  "PMI-ACP":  { vendor: "PMI",         color: "#004B8D", category: "Agile PM" },
  "SAL1":     { vendor: "ServiceNow",  color: "#62D84E", category: "ITSM" },
  "CompTIA CySA+": { vendor: "CompTIA", color: "#C2082F", category: "Security Analytics" },
  "AI Solutions on Cisco Infrastructure Essentials": { vendor: "Cisco", color: "#049FD9", category: "AI + Network" },
};

function VendorInitials(vendor: string): string {
  if (vendor === "ISC²") return "ISC²";
  if (vendor === "EC-Council") return "EC";
  if (vendor === "Palo Alto") return "PA";
  if (vendor === "ServiceNow") return "SN";
  if (vendor === "CompTIA") return "CT";
  return vendor.slice(0, 3).toUpperCase();
}

export function Certifications({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {profile.certifications.map((c) => {
          const meta = CERT_META[c] ?? { vendor: "Vendor", color: "#6B7280", category: "Certification" };
          return (
            <div
              key={c}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3 relative overflow-hidden group transition-colors hover:border-[color-mix(in_oklab,_var(--accent)_40%,_var(--border))]"
            >
              {/* Left accent bar */}
              <div
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: meta.color }}
              />
              {/* Vendor badge */}
              <div
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold leading-none text-center"
                style={{ background: meta.color }}
                aria-hidden
              >
                {VendorInitials(meta.vendor)}
              </div>
              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted-soft)] mb-0.5 truncate">
                  {meta.vendor}&thinsp;·&thinsp;{meta.category}
                </div>
                <div className="text-sm font-semibold leading-snug">{c}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs uppercase tracking-[0.18em] font-mono text-[var(--muted-soft)] mb-3">
          {lang === "th" ? "รางวัล / กิจกรรม" : "Awards & activities"}
        </p>
        <ul className="space-y-1.5 text-sm">
          {profile.awards.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-[var(--accent)]">•</span>
              <span>{pick(a, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
