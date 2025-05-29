"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Horse } from "@/models";
import { useTranslations } from "next-intl";
import { ITEMS_PER_PAGE, SKELETON_COUNT } from "@/utils/constants";

export default function HorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useParams();
  const t = useTranslations("horsesPage");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("created_desc");
  const [selectedBreed, setSelectedBreed] = useState("");

  useEffect(() => {
    const fetchHorses = async () => {
      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading horses:", error.message);
        setHorses([]);
      } else {
        const valid = (data || []).filter(
          (horse) =>
            horse.name &&
            horse.price &&
            horse.photos?.[0] &&
            horse.age !== null &&
            horse.age !== undefined
        );
        setHorses(valid);
      }

      setLoading(false);
    };

    fetchHorses();
  }, []);

  // Фильтрация и сортировка
  const filtered = horses.filter((h) =>
    selectedBreed ? h.breed === selectedBreed : true
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "price_asc":
        return (a.price ?? 0) - (b.price ?? 0);
      case "price_desc":
        return (b.price ?? 0) - (a.price ?? 0);
      case "age_asc":
        return a.age - b.age;
      case "age_desc":
        return b.age - a.age;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const currentHorses = sorted.slice(
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

      {/* Сортировка и фильтр */}
      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("sortBy")}</label>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="created_desc">{t("newest")}</option>
            <option value="price_asc">{t("priceAsc")}</option>
            <option value="price_desc">{t("priceDesc")}</option>
            <option value="age_asc">{t("ageAsc")}</option>
            <option value="age_desc">{t("ageDesc")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("breed")}</label>
          <select
            value={selectedBreed}
            onChange={(e) => {
              setSelectedBreed(e.target.value);
              setCurrentPage(1);
            }}
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
      </div>

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
      ) : sorted.length === 0 ? (
        <p className="text-center text-gray-500">{t("noHorses")}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentHorses.map((horse) => (
              <Link
                key={horse.id}
                href={`/${locale}/horse/${horse.id}`}
                className="block border rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={horse.photos[0]}
                    alt={horse.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{horse.name}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    {horse.breed || "—"} —{" "}
                    {`${horse.age} ${t("horseDetails.ageWithCount")}`}
                  </p>
                  {horse.description && (
                    <p className="text-sm mb-2 line-clamp-2 text-gray-800">
                      {horse.description}
                    </p>
                  )}
                  <p className="text-green-700 font-bold">
                    {horse?.price?.toLocaleString("ru-RU")} ₸
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center mt-8 gap-2">
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
          </div>
        </>
      )}
    </div>
  );
}
