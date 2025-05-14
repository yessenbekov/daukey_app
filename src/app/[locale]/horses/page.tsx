"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function HorsesPage() {
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useParams();

  useEffect(() => {
    const fetchHorses = async () => {
      const { data } = await supabase
        .from("horses")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      setHorses(data || []);
      setLoading(false);
    };

    fetchHorses();
  }, []);

  return (
    <div className="container max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Наши лошади</h1>
      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : horses.length === 0 ? (
        <p className="text-center text-gray-500">Лошади не найдены</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {horses.map((horse) => (
            <Link
              key={horse.id}
              href={`/${locale}/horse/${horse.id}`}
              className="block border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {horse.photos?.[0] && (
                <img
                  loading="lazy"
                  src={horse.photos[0]}
                  alt={horse.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{horse.name}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  {horse.breed} — {horse.age} лет
                </p>
                <p className="text-sm mb-2 line-clamp-2">{horse.description}</p>
                <p className="text-green-700 font-bold">
                  {horse.price.toLocaleString()} ₸
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
