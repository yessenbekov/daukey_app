"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-b from-black/70 via-black/40 to-transparent text-white shadow-md backdrop-blur-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={`/${locale}`} className="flex items-center gap-3">
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
          <Link href={`/${locale}`} className="hover:underline">
            {t("home")}
          </Link>
          <Link href={`/${locale}/horses`} className="hover:underline">
            {t("horses")}
          </Link>
          <LocaleSwitcher />
        </div>

        {/* Mobile */}
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
        <div className="md:hidden px-4 pb-4 space-y-2 bg-black/70 backdrop-blur-md">
          <Link href={`/${locale}`} className="block hover:underline">
            {t("home")}
          </Link>
          <Link href={`/${locale}/horses`} className="block hover:underline">
            {t("horses")}
          </Link>
          <LocaleSwitcher />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
