import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ru', 'kk'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`@/i18n/locales/${locale}.json`)).default,
    timeZone: 'Asia/Almaty'
  };
});
