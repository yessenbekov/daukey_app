"use client";

import React, { useState } from "react";
import {
  CalendarIcon,
  MessageCircleIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import InstallPrompt from "@/components/InstallPrompt";

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  const [expanded, setExpanded] = useState<string[]>(["riding", "kokpar"]);

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-12 text-gray-800"
    >
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 mt-5">
        {t("title")}
      </h1>
      <p className="text-center text-gray-500 text-sm sm:text-base mb-10 leading-relaxed">
        {t("subtitle")}
      </p>

      <section className="space-y-6">
        {/* Horse Riding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            className="w-full text-left p-5 sm:p-6 flex justify-between items-center text-lg sm:text-xl font-semibold"
            onClick={() => toggle("riding")}
          >
            <span className="flex items-center gap-2">
              🐎 {t("horseRiding")}
            </span>
            {expanded.includes("riding") ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {expanded.includes("riding") && (
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <ul className="text-sm sm:text-base space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("clubTerritory")} — 🕒 45 {t("minutes")} — 💰{" "}
                    <strong>6 500 ₸</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("ridingInMountains")} — 🕒 90–120 {t("minutes")} (
                    {t("dependsOnRider")}) — 💰 <strong>12 500 ₸</strong>
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Kokpar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            className="w-full text-left p-5 sm:p-6 flex justify-between items-center text-lg sm:text-xl font-semibold"
            onClick={() => toggle("kokpar")}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-black" /> {t("kokpar")}
            </span>
            {expanded.includes("kokpar") ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {expanded.includes("kokpar") && (
            <>
              <ul className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("oneTimeVisit")} — <strong>15 000 ₸</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("monthly")}:<br />
                    <span className="ml-4 block">
                      • {t("5timePerMonth")} — <strong>50 000 ₸</strong>
                    </span>
                    <span className="ml-4 block">
                      • {t("4timePerMonth")} — <strong>40 000 ₸</strong>
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("halfYear")} — <strong>221 000 ₸</strong>
                    <span className="block text-xs text-gray-500">
                      {t("halfYearDescription")}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    {t("yearly")} — <strong>390 000 ₸</strong>
                    <span className="block text-xs text-gray-500">
                      {t("yearlyDescription")}
                    </span>
                  </span>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>

      <div className="mt-6">
        <iframe
          src="https://www.instagram.com/reel/DKNOvY0Txdy/embed"
          className="w-full aspect-[9/16] rounded-xl border"
          allowFullScreen
          scrolling="no"
        />
      </div>

      <div className="mt-14 text-center bg-gray-50 py-10 px-4 rounded-xl shadow-inner">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">
          {t("readyForRidingOrTraining")}
        </h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {t("contactUsForMoreInfo")}
        </p>
        <a
          href="https://wa.me/77001234567?text=Здравствуйте!%20Хочу%20записаться%20на%20прогулку"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
        >
          <MessageCircleIcon className="w-5 h-5" />
          {t("writeWhatsapp")}
        </a>
      </div>
      <InstallPrompt />
      <footer className="text-center text-xs text-black mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by{" "}
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-red-600"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </motion.main>
  );
}
