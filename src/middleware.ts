// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Перенаправление с '/' на '/ru' по умолчанию
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/ru';
    return NextResponse.redirect(url);
  }

  // Извлечение локали из пути
  const locale = pathname.split('/')[1];
  if (!['en', 'ru', 'kk'].includes(locale)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-NEXT-INTL-LOCALE', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/', '/((?!_next|favicon.ico).*)'],
};
