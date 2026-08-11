"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Horse } from "@/models";
import { useTranslations } from "next-intl";
import {
  ITEMS_PER_PAGE,
  SKELETON_COUNT,
  whatsAppNumber,
} from "@/utils/constants";
import { ClipboardCopy, Search, Send, Share2, X } from "lucide-react";
import toast from "react-hot-toast";
import InstallPrompt from "@/components/InstallPrompt";

export default function HorsesPage() {
  const supabase = createClient();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useParams();
  const t = useTranslations("horsesPage");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"" | "for_sale" | "private">("");
  const [search, setSearch] = useState("");
  const [openShareId, setOpenShareId] = useState<string | null>(null);

  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setOpenShareId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHorses = async () => {
      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading horses:", error.message);
        setHorses([]);
      } else {
        const valid = (data || []).filter(
          (horse) =>
            horse.name && horse.year !== null && horse.year !== undefined
        );
        setHorses(valid);
      }

      setLoading(false);
    };

    fetchHorses();
  }, []);

  // Если после фильтрации текущая страница стала недоступна (например,
  // пользователь был на странице 3, а поиск/порода сузили список до одной
  // страницы), возвращаемся на первую — иначе сетка молча показывает пусто.
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBreed, selectedStatus, search]);

  // Фильтрация по породе, статусу и живому поиску по кличке
  const hasActiveFilters = Boolean(
    selectedBreed || selectedStatus || search.trim()
  );
  const filtered = horses.filter((h) => {
    const matchesBreed = selectedBreed ? h.breed === selectedBreed : true;
    const matchesStatus = selectedStatus
      ? selectedStatus === "private"
        ? Boolean(h.owner_id)
        : !h.owner_id && h.for_sale
      : true;
    const matchesSearch = search.trim()
      ? h.name.toLowerCase().includes(search.trim().toLowerCase())
      : true;
    return matchesBreed && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentHorses = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container max-w-6xl mx-auto py-10 pt-24">
      <h1 className="text-3xl font-bold mt-15 mb-2 text-center">
        {t("title")}
      </h1>

      <p className="text-center text-gray-600 mb-8 flex justify-center items-center gap-2">
        <span className="text-lg">🐎</span>
        <span className="border-b border-gray-300 pb-1">{t("subtitle")}</span>
      </p>

      {/* Поиск и фильтр */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-3">
        <div className="relative w-full max-w-xs">
          <label htmlFor="horse-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="horse-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full border rounded px-3 py-1.5 pl-9 pr-8 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label={t("clearSearch")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="horse-breed" className="text-sm font-medium">
            {t("breed")}
          </label>
          <select
            id="horse-breed"
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">{t("allBreeds")}</option>
            {Array.from(new Set(horses.map((h) => h.breed)))
              .filter(Boolean)
              .map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="horse-status" className="text-sm font-medium">
            {t("status")}
          </label>
          <select
            id="horse-status"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "" | "for_sale" | "private")
            }
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="for_sale">{t("statusForSale")}</option>
            <option value="private">{t("statusPrivate")}</option>
          </select>
        </div>
      </div>

      {!loading && horses.length > 0 && (
        <p className="text-center text-xs text-gray-500 mb-6">
          {t("resultsCount", { count: filtered.length, total: horses.length })}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse border rounded-xl overflow-hidden shadow-md"
            >
              <div className="bg-gray-300 h-48 w-full" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-300 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>{hasActiveFilters ? t("noHorsesMatch") : t("noHorses")}</p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedBreed("");
              }}
              className="mt-3 text-sm underline hover:text-gray-800"
            >
              {t("resetFilters")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentHorses.map((horse) => (
              <div
                key={horse.id}
                className="relative border rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <Link href={`/${locale}/horse/${horse.id}`} className="block">
                  <div className="relative aspect-video w-full bg-gray-100">
                    {horse.photos?.[0] ? (
                      <Image
                        src={horse.photos[0]}
                        alt={horse.name}
                        fill
                        className="object-contain"
                        sizes="(min-width: 768px) 33vw, 100vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-1 bg-gradient-to-br from-amber-50 to-stone-100 text-amber-900/40">
                        <span className="text-5xl">🐎</span>
                        <span className="text-xs text-amber-900/50">
                          {t("noPhoto")}
                        </span>
                      </div>
                    )}
                    {horse.owner_id ? (
                      <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full text-white bg-gray-700">
                        {t("statusPrivate")}
                      </span>
                    ) : (
                      horse.for_sale && (
                        <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full text-white bg-green-800">
                          {t("statusForSale")}
                        </span>
                      )
                    )}
                  </div>
                  <div className="p-4 pb-2">
                    <h2 className="text-xl font-bold mb-2">{horse.name}</h2>
                    <p className="text-sm text-gray-600 mb-1">
                      {horse.breed || "—"} —{" "}
                      {`${horse.year} ${t("horseDetails.ageWithCount")}`}
                    </p>
                    {horse.description && (
                      <p className="text-sm mb-2 line-clamp-2 text-gray-800">
                        {horse.description}
                      </p>
                    )}
                    {horse.price != null && !horse.owner_id && horse.for_sale && (
                      <p className="text-green-700 font-bold">
                        {horse.price.toLocaleString("ru-RU")} ₸
                      </p>
                    )}
                  </div>
                </Link>

                {/* Share button & popover */}
                <div className="absolute top-2 right-2 z-40">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenShareId(openShareId === horse.id ? null : horse.id)
                    }
                    className="text-gray-500 hover:text-black transition active:scale-90"
                    title="Поделиться"
                  >
                    <Share2 size={18} />
                  </button>

                  {openShareId === horse.id && (
                    <div className="absolute bottom-full mb-2 right-0 z-50">
                      <div className="relative bg-white border shadow-md rounded-lg w-56">
                        {/* стрелочка */}
                        <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white border-l border-b rotate-45 z-[-1]" />

                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/${locale}/horse/${horse.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Ссылка скопирована!");
                            setOpenShareId(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          <ClipboardCopy size={16} /> Скопировать ссылку
                        </button>

                        <a
                          href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
                            `${horse.name} — ${window.location.origin}/${locale}/horse/${horse.id}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setOpenShareId(null)}
                        >
                          <Send size={16} /> Поделиться в WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center mt-8 gap-2">
            {totalPages > 1 && (
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                {t("prevPage")}
              </button>
            )}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded ${
                    pageNum === currentPage
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 1 && (
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                {t("nextPage")}
              </button>
            )}
          </div>
        </>
      )}
      <InstallPrompt />
      <footer className="text-center text-xs text-black mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-red-600"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </div>
  );
}
