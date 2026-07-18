import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const locales = ["en", "ru", "kk"];
const defaultLocale = "kk";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

const PROTECTED_PREFIXES = ["/admin", "/dashboard"];

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*|$)/);
  if (match && locales.includes(match[1])) {
    return match[2] || "/";
  }
  return pathname;
}

function localeFromPathname(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
  return match && locales.includes(match[1]) ? match[1] : defaultLocale;
}

export default async function middleware(request: NextRequest) {
  // Обновляет/валидирует auth-сессию (обязательно для Server Components ниже
  // по цепочке). Роль/статус (admin vs owner, pending vs approved) здесь не
  // проверяем — это делает сама страница; middleware отсекает только
  // полностью неавторизованных.
  const { response: authResponse, user } = await updateSession(request);

  const logicalPath = stripLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => logicalPath === prefix || logicalPath.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const locale = localeFromPathname(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const intlResponse = intlMiddleware(request);

  // Переносим обновлённые auth-куки на ответ next-intl middleware, чтобы
  // ни сессия, ни locale-роутинг не потерялись.
  authResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!favicon\\.ico|robots\\.txt|manifest\\.json|offline\\.html|icons/.*|sw\\.js|_next/.*|images/.*).*)",
  ],
};
