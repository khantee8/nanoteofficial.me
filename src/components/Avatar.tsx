import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

function hasPhoto() {
  try {
    return existsSync(path.join(process.cwd(), "public", "profile.jpg"));
  } catch {
    return false;
  }
}

export function Avatar({ size = 144, lang = "en" }: { size?: number; lang?: Lang }) {
  const photo = hasPhoto();
  const name = pick(profile.name, lang);
  const monogram = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden ring-1 ring-[var(--border)] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)]"
      style={{ width: size, height: size }}
      aria-label={`${name} portrait`}
    >
      {photo ? (
        <Image
          src="/profile.jpg"
          alt={`${name} portrait`}
          width={size * 2}
          height={size * 2}
          priority
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full grid place-items-center bg-gradient-to-br from-[color-mix(in_oklab,var(--accent)_25%,transparent)] to-[color-mix(in_oklab,var(--accent)_5%,transparent)]">
          <span
            className="font-semibold tracking-tight text-[var(--accent)]"
            style={{ fontSize: size * 0.42 }}
          >
            {monogram}
          </span>
        </div>
      )}
    </div>
  );
}
