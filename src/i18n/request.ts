import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ru", "kk"];
export const defaultLocale = "kk";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
