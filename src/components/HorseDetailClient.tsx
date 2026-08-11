"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { X, Share2, ClipboardCopy, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Horse } from "@/models";
import { useTranslations } from "next-intl";
import { whatsAppNumber } from "@/utils/constants";
import { toEmbedUrl } from "@/utils/embedUrl";

export default function HorseDetailClient({ horse }: { horse: Horse }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [openShare, setOpenShare] = useState(false);
  const t = useTranslations("horseDetailsPage");
  const tHorses = useTranslations("horsesPage");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#share-popover")) {
        setOpenShare(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextPhoto = () =>
    setCurrentPhoto((prev) => (prev + 1) % (horse.photos.length || 1));
  const prevPhoto = () =>
    setCurrentPhoto(
      (prev) =>
        (prev - 1 + (horse.photos.length || 1)) % (horse.photos.length || 1)
    );

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
      else if (e.key === "ArrowRight") nextPhoto();
      else if (e.key === "ArrowLeft") prevPhoto();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const openModal = (index: number) => {
    setCurrentPhoto(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleContactClick = () => {
    const url = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
      `${horse.name} — ${window.location.href}`
    )}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{horse.name}</h1>
        <div className="relative">
          <button
            onClick={() => setOpenShare((prev) => !prev)}
            className="text-gray-600 hover:text-black transition"
          >
            <Share2 size={20} />
          </button>

          {openShare && (
            <div
              id="share-popover"
              className="absolute right-0 top-full mt-2 bg-white border shadow-md rounded-lg w-56 z-50"
            >
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast.success(t("copied"));
                  setOpenShare(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <ClipboardCopy size={16} /> {t("copyLink")}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${horse.name} — ${window.location.href}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => setOpenShare(false)}
              >
                <Send size={16} /> {t("shareWhatsApp")}
              </a>
            </div>
          )}
        </div>
      </div>

      {horse.owner_id ? (
        <p className="inline-block text-xs font-medium px-2 py-1 rounded-full text-white mb-4 bg-gray-700">
          {tHorses("statusPrivate")}
        </p>
      ) : (
        horse.for_sale && (
          <p className="inline-block text-xs font-medium px-2 py-1 rounded-full text-white mb-4 bg-green-800">
            {tHorses("statusForSale")}
          </p>
        )
      )}

      {horse.photos?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Image
            priority
            src={horse.photos[0]}
            alt={horse.name}
            width={600}
            height={400}
            className="rounded shadow object-contain bg-gray-100 w-full h-72 md:h-96 cursor-pointer"
            onClick={() => openModal(0)}
          />

          <div className="grid grid-cols-2 gap-2">
            {horse.photos.slice(1).map((url: string, idx: number) => (
              <Image
                key={idx + 1}
                loading="lazy"
                src={url}
                alt={`${horse.name} ${idx + 2}`}
                width={150}
                height={100}
                className="rounded shadow object-contain bg-gray-100 w-full h-28 cursor-pointer"
                onClick={() => openModal(idx + 1)}
              />
            ))}
          </div>
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
                alt={horse.name}
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
            {horse.photos.length > 1 && (
              <div className="flex justify-between mt-4 text-white">
                <button onClick={prevPhoto}>&larr; {t("prevPhoto")}</button>
                <button onClick={nextPhoto}>{t("nextPhoto")} &rarr;</button>
              </div>
            )}
          </div>
        </Dialog>
      )}

      <div className="space-y-2 text-lg mt-6">
        {horse.breed && (
          <p>
            <strong>{t("breed")}:</strong> {horse.breed}
          </p>
        )}
        {horse.year != null && (
          <p>
            <strong>{t("age")}:</strong> {horse.year}
          </p>
        )}
        {horse.color && (
          <p>
            <strong>{t("color")}:</strong> {horse.color}
          </p>
        )}
        {horse.height != null && (
          <p>
            <strong>{t("height")}:</strong> {horse.height} см
          </p>
        )}
        {horse.weight != null && (
          <p>
            <strong>{t("weight")}:</strong> {horse.weight} кг
          </p>
        )}
        {horse.price != null && !horse.owner_id && horse.for_sale && (
          <p>
            <strong>{t("price")}:</strong> {horse.price.toLocaleString()} ₸
          </p>
        )}
        {horse.description && (
          <p>
            <strong>{t("description")}:</strong> {horse.description}
          </p>
        )}
      </div>

      {horse.videos?.length > 0 && (
        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">{t("videos")}</h2>
          {horse.videos.map((link: string, idx: number) => (
            <div key={idx} className="aspect-video w-full">
              <iframe
                loading="lazy"
                src={toEmbedUrl(link)}
                title={`${horse.name} — видео ${idx + 1}`}
                allowFullScreen
                className="w-full h-full rounded"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleContactClick}
          className="w-full sm:w-auto bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          {t("contact")}
        </button>
      </div>
    </>
  );
}
