import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ru", "kk"],
  defaultLocale: "kk",
  localePrefix: "as-needed", // 👈 решает редирект / -> /en
});

export const config = {
  matcher: [
    "/((?!favicon\\.ico|robots\\.txt|manifest\\.json|offline\\.html|icons/.*|sw\\.js|_next/.*|images/.*).*)",
  ],
};
