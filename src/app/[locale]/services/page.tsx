"use client";

import React from "react";
import {
  MountainIcon,
  TicketIcon,
  CalendarIcon,
  HouseIcon,
  MessageCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-16 text-gray-800"
    >
      <h1 className="text-4xl font-bold text-center mb-2 mt-5">{t("title")}</h1>
      <p className="text-center text-gray-500 mb-10">{t("subtitle")}</p>

      <section className="space-y-8">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-2">
            🐎
            <h2 className="text-2xl font-semibold">{t("horseRiding")}</h2>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              {t("clubTerritory")} — <span className="mr-1">🕒</span>{" "}
              <strong>{`45 ${t("minutes")}`}</strong> —{" "}
              <span className="mr-1">💰</span> <strong>6 500 ₸</strong>
            </li>
            <li>
              {t("ridingInMountains")} — <span className="mr-1">🕒</span>{" "}
              <strong>{`90–120 ${t("minutes")}`}</strong> ({t("dependsOnRider")}
              ) — <span className="mr-1">💰</span> <strong>12 500 ₸</strong>
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-black" />
            <h2 className="text-2xl font-semibold">{t("kokpar")}</h2>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              {t("oneTimeVisit")} — <strong>15 000 ₸</strong>
            </li>
            <li>
              {t("monthly")}:{" "}
              <ul className="list-disc list-inside ml-5">
                <li>
                  {t("5timePerMonth")} — <strong>50 000 ₸</strong>
                </li>
                <li>
                  {t("4timePerMonth")} — <strong>40 000 ₸</strong>
                </li>
              </ul>
            </li>
            <li>
              {t("halfYear")} — <strong>221 000 ₸</strong>{" "}
              <span className="text-sm text-gray-500">
                ({t("halfYearDescription")})
              </span>
            </li>
            <li>
              {t("yearly")} — <strong>390 000 ₸</strong>{" "}
              <span className="text-sm text-gray-500">
                ({t("yearlyDescription")})
              </span>
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-16 text-center bg-gray-50 py-10 px-4 rounded-xl shadow-inner">
        <h3 className="text-2xl font-semibold mb-4">
          {t("readyForRidingOrTraining")}
        </h3>
        <p className="text-gray-600 mb-6">{t("contactUsForMoreInfo")}</p>
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

      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-4">{t("askedQuestions")}</h2>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Можно ли кататься без опыта?</strong> — Да, инструктора
            помогут и подберут спокойную лошадь.
          </li>
          <li>
            <strong>Что надеть?</strong> — Удобную одежду, закрытую обувь и
            головной убор.
          </li>
        </ul>
      </div>
    </motion.main>
  );
}
