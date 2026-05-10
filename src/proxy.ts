import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const subdomainMap: Record<string, string> = {
  finance: "/finance",
  cyber: "/cyber",
  kb: "/kb",
  art: "/art",
};

const ROOT_DOMAIN = "nanoteofficial.me";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();

  if (!hostname.endsWith(ROOT_DOMAIN)) {
    return NextResponse.next();
  }

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  const sub = hostname.slice(0, hostname.length - ROOT_DOMAIN.length - 1);
  const basePath = subdomainMap[sub];
  if (!basePath) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (url.pathname.startsWith(basePath)) {
    return NextResponse.next();
  }
  url.pathname = `${basePath}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
