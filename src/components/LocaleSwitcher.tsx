"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

const locales = ["en", "ru", "kk"];

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-transparent text-white border rounded px-2 py-1 text-xs"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
