import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function Navbar() {
  const t = useTranslations('navbar'); // Указываем namespace
  const locale = useLocale()
  
  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-black shadow-md">
      <div className="flex items-center gap-4">
        <Image
          src="/images/logo.svg"
          alt="Daukey App"
          width={40}
          height={40}
          className="rounded-full shadow-md"
        />
        <h1 className="text-2xl font-serif font-bold text-black dark:text-white tracking-wide">
          Daukey App
        </h1>
      </div>
      <div className="flex gap-6 ml-auto">
        <Link href={`/${locale}`} className="text-black dark:text-white hover:underline">
          {t('home')} {/* Теперь используем короткий ключ */}
        </Link>
        <Link
          href={`/${locale}/horses`}
          className="text-black dark:text-white hover:underline"
        >
          {t('horses')}
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;