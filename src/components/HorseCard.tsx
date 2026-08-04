"use client";

import { useState } from "react";
import { Horse } from "@/models";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

type Props = {
  horse: Horse;
  onEdit: (horse: Horse) => void;
  onDelete: (id: string) => void;
};

export default function HorseCard({ horse, onEdit, onDelete }: Props) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photos = horse.photos || [];

  const openGallery = (index: number) => {
    setCurrentPhoto(index);
    setGalleryOpen(true);
  };

  const nextPhoto = () => setCurrentPhoto((prev) => (prev + 1) % photos.length);
  const prevPhoto = () =>
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="border rounded-xl overflow-hidden shadow-md bg-white relative">
      {photos[0] && (
        <button
          type="button"
          onClick={() => openGallery(0)}
          className="relative aspect-video w-full block"
        >
          <Image
            src={photos[0]}
            alt={horse.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{photos.length - 1} фото
            </span>
          )}
        </button>
      )}
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-bold">{horse.name}</h2>
        <p className="text-sm text-gray-600">
          {horse.breed} — {horse.year} год
        </p>
        {horse.price != null && (
          <p className="text-green-700 font-semibold">
            {horse.price.toLocaleString("ru-RU")} ₸
          </p>
        )}
        {horse.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {horse.description}
          </p>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => onEdit(horse)}
          className="bg-white border rounded px-2 py-1 text-xs hover:bg-gray-100"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(horse.id)}
          className="bg-white border rounded px-2 py-1 text-xs hover:bg-gray-100 text-red-500"
        >
          🗑
        </button>
      </div>

      {galleryOpen && (
        <Dialog
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <div className="relative w-full max-w-3xl p-4">
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-2 right-2 text-white"
            >
              <X size={24} />
            </button>
            {photos[currentPhoto] && (
              <Image
                width={300}
                height={200}
                src={photos[currentPhoto]}
                alt={horse.name}
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
            {photos.length > 1 && (
              <div className="flex justify-between mt-4 text-white">
                <button type="button" onClick={prevPhoto}>
                  &larr; Предыдущее
                </button>
                <span className="text-sm text-white/70">
                  {currentPhoto + 1} / {photos.length}
                </span>
                <button type="button" onClick={nextPhoto}>
                  Следующее &rarr;
                </button>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
