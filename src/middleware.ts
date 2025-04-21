import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_LOCALES = ['ru', 'kk', 'en'];
const DEFAULT_LOCALE = 'ru';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, указана ли локаль в пути
  const pathnameIsMissingLocale = PUBLIC_LOCALES.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = DEFAULT_LOCALE;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|images|icon.png).*)',
  ],
};