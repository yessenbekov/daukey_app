// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ru', 'kk'],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/', '/(en|ru|kk)/:path*'],
};
