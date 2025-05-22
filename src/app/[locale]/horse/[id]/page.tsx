"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { Horse } from "@/models";

function convertToEmbedUrl(url: string): string {
  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/");
  } else if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  } else if (url.includes("youtube.com/shorts/")) {
    const id = url.split("shorts/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

export default function HorseDetailsPage() {
  const { id } = useParams();
  const [horse, setHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const fetchHorse = async () => {
      const { data } = await supabase
        .from("horses")
        .select("*")
        .eq("id", id)
        .single();
      setHorse(data);
      setLoading(false);
    };
    if (id) fetchHorse();
  }, [id]);

  const openModal = (index: number) => {
    setCurrentPhoto(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const nextPhoto = () =>
    setCurrentPhoto((prev) => (prev + 1) % (horse?.photos.length || 1));
  const prevPhoto = () =>
    setCurrentPhoto(
      (prev) =>
        (prev - 1 + (horse?.photos.length || 1)) % (horse?.photos.length || 1)
    );

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (!horse) return <p className="p-4 text-red-500">Лошадь не найдена</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{horse.name}</h1>

      {horse.photos?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {horse.photos.map((url: string, idx: number) => (
            <Image
              loading="lazy"
              key={idx}
              src={url}
              alt={`Фото ${idx + 1}`}
              width={300}
              height={200}
              className="rounded shadow object-cover w-full h-48 cursor-pointer"
              onClick={() => openModal(idx)}
            />
          ))}
        </div>
      )}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <div className="relative w-full max-w-3xl p-4">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white"
            >
              <X size={24} />
            </button>
            {horse.photos?.[currentPhoto] && (
              <Image
                width={300}
                height={200}
                loading="lazy"
                src={horse.photos[currentPhoto]}
                alt="Просмотр фото"
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
            {horse.photos.length > 1 && (
              <div className="flex justify-between mt-4">
                <button onClick={prevPhoto} className="text-white">
                  ← Предыдущее
                </button>
                <button onClick={nextPhoto} className="text-white">
                  Следующее →
                </button>
              </div>
            )}
          </div>
        </Dialog>
      )}

      <p className="text-lg mb-2">
        <strong>Порода:</strong> {horse.breed}
      </p>
      <p className="text-lg mb-2">
        <strong>Возраст:</strong> {horse.age} лет
      </p>
      <p className="text-lg mb-2">
        <strong>Цена:</strong> {horse.price.toLocaleString()} ₸
      </p>
      <p className="mb-4">
        <strong>Описание:</strong> {horse.description}
      </p>

      {horse.videos?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Видео</h2>
          {horse.videos.map((link: string, idx: number) => (
            <div key={idx} className="aspect-video w-full">
              <iframe
                loading="lazy"
                src={convertToEmbedUrl(link)}
                title={`Видео ${idx + 1}`}
                allowFullScreen
                className="w-full h-full rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
