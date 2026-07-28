"use client";

import React, { useEffect, useState } from "react";
import { MessageCircleIcon, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import InstallPrompt from "@/components/InstallPrompt";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { Service } from "@/models";

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₸`;
}

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

      const list = (data || []) as Service[];
      setServices(list);
      setExpanded(Array.from(new Set(list.map((s) => s.category))));
      setLoading(false);
    };
    fetchServices();
  }, []);

  const toggle = (category: string) => {
    setExpanded((prev) =>
      prev.includes(category)
        ? prev.filter((key) => key !== category)
        : [...prev, category]
    );
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));

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

      {loading ? (
        <Spinner label="Загружаем услуги..." />
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">
          Пока нет доступных услуг
        </p>
      ) : (
        <section className="space-y-6">
          {categories.map((category) => {
            const items = services.filter((s) => s.category === category);
            const isOpen = expanded.includes(category);
            return (
              <div
                key={category}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  className="w-full text-left p-5 sm:p-6 flex justify-between items-center text-lg sm:text-xl font-semibold"
                  onClick={() => toggle(category)}
                >
                  <span>{category}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {isOpen && (
                  <ul className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base space-y-2 text-gray-700">
                    {items.map((service) => (
                      <li key={service.id} className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>
                          {service.name}
                          {service.description && (
                            <span className="block text-xs text-gray-500">
                              {service.description}
                            </span>
                          )}
                          {" — "}
                          <strong>{formatPrice(service.price)}</strong>
                          {service.unit && ` (${service.unit})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div className="mt-6">
        <iframe
          src="https://www.instagram.com/reel/DKNOvY0Txdy/embed"
          className="w-full aspect-[9/16] rounded-xl border"
          allowFullScreen
          scrolling="no"
        />
      </div>

      <div className="mt-14 text-center bg-gray-50 py-10 px-4 rounded-xl shadow-inner">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          {t("readyForRidingOrTraining")}
        </h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {t("contactUsForMoreInfo")}
        </p>
        <a
          href="https://wa.me/77001234567?text=Здравствуйте!%20Хочу%20записаться%20на%20прогулку"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-900 transition"
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
