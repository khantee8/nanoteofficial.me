"use client";
import { usePathname } from "next/navigation";

/** Marketing chrome wrapper — renders nothing inside the /plan workspace,
 *  which brings its own navigation (sidebar + mobile top bar). */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/plan" || path.startsWith("/plan/")) return null;
  return <>{children}</>;
}
