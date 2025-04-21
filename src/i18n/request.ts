import { getRequestConfig as getIntlRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ru', 'kk'] as const;
export const defaultLocale = 'ru';
export type Locale = (typeof locales)[number];

export default async function getRequestConfig() {
  const getConfig = getIntlRequestConfig((params) => ({
    locale: params.locale || defaultLocale,
    messages: {},
  }));
  const requestConfig = await getConfig({
      locale: defaultLocale,
      requestLocale: Promise.resolve(undefined)
  });
  const locale = requestConfig.locale;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`@/i18n/locales/${locale}.json`)).default,
    timeZone: 'Asia/Almaty',
  };
}
