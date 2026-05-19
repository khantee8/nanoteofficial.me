import Image from "next/image";
import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

const CERT_META: Record<string, { vendor: string; color: string; category: string; logo: string }> = {
  "CISSP":    { vendor: "ISC²",        color: "#009CDE", category: "Cybersecurity",      logo: "/logos/isc2.svg" },
  "CEH":      { vendor: "EC-Council",  color: "#B91C1C", category: "Ethical Hacking",     logo: "/logos/eccouncil.svg" },
  "CCNP-Enterprise": { vendor: "Cisco", color: "#049FD9", category: "Enterprise Network", logo: "/logos/cisco.svg" },
  "CCNP-Security":   { vendor: "Cisco", color: "#049FD9", category: "Network Security",  logo: "/logos/cisco.svg" },
  "Fortinet FCP":    { vendor: "Fortinet", color: "#EE3124", category: "Network Security", logo: "/logos/fortinet.svg" },
  "PCNSE":    { vendor: "Palo Alto",   color: "#FA582D", category: "Firewall",            logo: "/logos/paloaltonetworks.svg" },
  "PMI-ACP":  { vendor: "PMI",         color: "#004B8D", category: "Agile PM",            logo: "/logos/pmi.svg" },
  "SAL1":     { vendor: "ServiceNow",  color: "#62D84E", category: "ITSM",                logo: "/logos/servicenow.svg" },
  "CompTIA CySA+": { vendor: "CompTIA", color: "#C2082F", category: "Security Analytics", logo: "/logos/comptia.svg" },
  "Investment Consultant (IC) License": { vendor: "SEC Thailand", color: "#1565C0", category: "Finance", logo: "/logos/sec-thailand.svg" },
  "AI Solutions on Cisco Infrastructure Essentials": { vendor: "Cisco", color: "#049FD9", category: "AI + Network", logo: "/logos/cisco.svg" },
};

export function Certifications({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {profile.certifications.map((c) => {
          const meta = CERT_META[c] ?? { vendor: "Vendor", color: "#6B7280", category: "Certification", logo: "" };
          return (
            <div
              key={c}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3 relative overflow-hidden group transition-colors hover:border-[color-mix(in_oklab,_var(--accent)_40%,_var(--border))]"
            >
              <div
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: meta.color }}
              />
              <div
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center p-1.5"
                style={{ background: `color-mix(in oklab, ${meta.color} 12%, var(--surface))` }}
                aria-hidden
              >
                {meta.logo ? (
                  <Image
                    src={meta.logo}
                    alt={meta.vendor}
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <span
                    className="text-[10px] font-bold text-white"
                    style={{ color: meta.color }}
                  >
                    {meta.vendor.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>
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
          {lang === "th" ? "ภาวะผู้นำและกิจกรรมวิชาชีพ" : "Leadership & professional activities"}
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
