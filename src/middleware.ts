import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Редирект с `/` на `/ru` по умолчанию
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/ru";
    return NextResponse.redirect(url);
  }

  // Получаем локаль из пути
  const locale = pathname.split("/")[1] || "ru";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("X-NEXT-INTL-LOCALE", locale);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/", "/((?!_next|favicon.ico).*)"],
};
