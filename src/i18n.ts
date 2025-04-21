import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ru', 'kk'];
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  const resolvedLocale = locale || defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`./locales/${resolvedLocale}.json`)).default,
    timeZone: 'Asia/Almaty'
  };
});
