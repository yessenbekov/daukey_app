import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Navbar() {
  const t = useTranslations("navbar"); // Указываем namespace
  const locale = useLocale();

  return (
    <nav className="flex justify-between items-center p-4 bg-black shadow-md">
      <Link href="/">
        <div className="flex items-center gap-4">
          <Image
            loading="lazy"
            src="/images/logo.svg"
            alt="Daukey App"
            width={40}
            height={40}
            className="rounded-full shadow-md"
          />
          <h1 className="text-xl font-serif font-bold text-white tracking-wide">
            Daukey App
          </h1>
        </div>
      </Link>
      <div className="flex gap-6 ml-auto">
        <Link href={`/${locale}`} className="text-white hover:underline">
          {t("home")} {/* Теперь используем короткий ключ */}
        </Link>
        <Link href={`/${locale}/horses`} className="text-white hover:underline">
          {t("horses")}
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  );
}

export default Navbar;
