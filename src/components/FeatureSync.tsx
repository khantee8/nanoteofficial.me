"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const map: Record<string, string> = {
  "/finance": "finance",
  "/cyber": "cyber",
  "/kb": "kb",
  "/art": "art",
};

function featureFor(pathname: string): string {
  for (const prefix of Object.keys(map)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return map[prefix];
  }
  return "brand";
}

export function FeatureSync() {
  const pathname = usePathname();
  useEffect(() => {
    const feature = featureFor(pathname || "/");
    if (feature === "brand") {
      document.body.removeAttribute("data-feature");
    } else {
      document.body.setAttribute("data-feature", feature);
    }
  }, [pathname]);
  return null;
}
