// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'ru'
});

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)']
};
