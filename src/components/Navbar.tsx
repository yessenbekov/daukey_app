"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { usePathname } from "next/navigation";

export function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const isHorses = pathname.startsWith(`/${locale}/horses`);
  const isServices = pathname.startsWith(`/${locale}/services`);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => setMenuOpen(false);

  const navItemClass =
    "flex items-center gap-1 text-sm transition-all duration-200";

  return (
    <nav
      className={`fixed top-0 w-full z-50 backdrop-blur-md shadow-sm bg-black/60 text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3"
          onClick={handleNavClick}
        >
          <Image
            src="/images/logo.svg"
            alt="Daukey App"
            width={36}
            height={36}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold font-serif tracking-wide leading-tight">
            Daukey App
          </h1>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <Link href={`/${locale}`} className={navItemClass}>
            {isHome && <span className="text-primary">•</span>}
            <span
              className={`${
                isHome
                  ? "font-semibold underline underline-offset-4"
                  : "hover:opacity-70"
              }`}
            >
              {t("home")}
            </span>
          </Link>

          <Link href={`/${locale}/horses`} className={navItemClass}>
            {isHorses && <span className="text-primary">•</span>}
            <span
              className={`${
                isHorses
                  ? "font-semibold underline underline-offset-4"
                  : "hover:opacity-70"
              }`}
            >
              {t("horses")}
            </span>
          </Link>

          <Link href={`/${locale}/services`} className={navItemClass}>
            {isServices && <span className="text-primary">•</span>}
            <span
              className={`${
                isServices
                  ? "font-semibold underline underline-offset-4"
                  : "hover:opacity-70"
              }`}
            >
              {t("services")}
            </span>
          </Link>

          <LocaleSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={`md:hidden px-4 pb-4 space-y-2 bg-black/80 text-white`}>
          <Link
            href={`/${locale}`}
            onClick={handleNavClick}
            className={`${navItemClass} py-1`}
          >
            {isHome && <span className="text-primary">•</span>}
            <span
              className={`${
                isHome
                  ? "font-semibold underline underline-offset-4"
                  : "hover:underline"
              }`}
            >
              {t("home")}
            </span>
          </Link>

          <Link
            href={`/${locale}/horses`}
            onClick={handleNavClick}
            className={`${navItemClass} py-1`}
          >
            {isHorses && <span className="text-primary">•</span>}
            <span
              className={`${
                isHorses
                  ? "font-semibold underline underline-offset-4"
                  : "hover:underline"
              }`}
            >
              {t("horses")}
            </span>
          </Link>

          <Link
            href={`/${locale}/services`}
            onClick={handleNavClick}
            className={`${navItemClass} py-1`}
          >
            {isServices && <span className="text-primary">•</span>}
            <span
              className={`${
                isServices
                  ? "font-semibold underline underline-offset-4"
                  : "hover:underline"
              }`}
            >
              {t("services")}
            </span>
          </Link>

          <LocaleSwitcher />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
