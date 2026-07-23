"use client";

import { socialLinks, whatsAppNumber } from "@/utils/constants";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import InstallPrompt from "@/components/InstallPrompt";

export default function Home() {
  const t = useTranslations("homePage");

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/alone.jpeg')" }}
    >
      <motion.div
        className="p-6 max-w-4xl w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2
          className="text-xl font-semibold mt-15 mb-4 text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          {t("socialMedia")}
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mt-6">
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-white/10 border border-transparent rounded-2xl p-4 shadow-md backdrop-blur-sm hover:scale-105 hover:ring-2 hover:ring-white/30 transition"
            >
              {icon}
              <p className="text-white text-sm font-medium mt-2 min-h-[1.5rem] text-center">
                {label}
              </p>
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-10 px-4 w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2
          className="text-xl font-semibold mb-4 text-white text-center"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          {t("location")}
        </h2>

        <div className="flex items-start gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-md shadow-md text-white">
          <div className="mt-1">
            <MapPin className="text-white" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-base leading-tight">
              Almaty, Сагадат Нұрмагамбетов, 230/1
            </p>
            <p className="text-sm text-white/80">🕒 10:00 – 20:00</p>
            <p className="text-sm text-white/60 italic">
              {t("workTime")} {/* например: Жұма – демалыс күні */}
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <a
            href="https://go.2gis.com/Y45kg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-5 py-4 rounded-2xl bg-black/40 p-4 rounded-2xl backdrop-blur-md shadow-md text-white transition group"
          >
            <img src="/icons/2gis.svg" alt="2GIS" className="h-8" />
            <span className="text-white text-xl transform transition-transform group-hover:translate-x-1">
              ›
            </span>
          </a>

          <a
            href="https://maps.app.goo.gl/yDgemn1svCj2w9mx6"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-between px-5 py-4 rounded-2xl bg-black/40 p-4 rounded-2xl backdrop-blur-md shadow-md text-white transition group"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icons/google-maps.svg"
                alt="Google Maps"
                className="w-10 h-10"
              />
              <span className="text-white text-base">Google Maps</span>
            </div>
            <span className="text-white text-xl transform transition-transform group-hover:translate-x-1">
              ›
            </span>
          </a>
        </div>
      </motion.div>

      <div className="mt-10 mb-5 px-4 w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md text-white text-center p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">{t("wannaKnowMore")}</h3>
          <p className="mb-4 text-sm text-white/80">
            {t("contactUsForMoreInfo")}
          </p>
          <a
            href={`https://wa.me/${whatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition"
          >
            {t("writeToWpp")}
          </a>
        </div>
      </div>

      <InstallPrompt />
      <footer className="text-center text-xs text-white/60 mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by{" "}
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </main>
  );
}
