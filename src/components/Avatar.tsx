import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { profile } from "@/lib/profile";

const monogram = profile.name
  .split(" ")
  .map((n) => n[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

function hasPhoto() {
  try {
    return existsSync(path.join(process.cwd(), "public", "profile.jpg"));
  } catch {
    return false;
  }
}

export function Avatar({ size = 144 }: { size?: number }) {
  const photo = hasPhoto();
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden ring-1 ring-[var(--border)] shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)]"
      style={{ width: size, height: size }}
      aria-label={`${profile.name} portrait`}
    >
      {photo ? (
        <Image
          src="/profile.jpg"
          alt={`${profile.name} portrait`}
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
