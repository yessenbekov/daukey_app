import Image from "next/image";
import React from "react";

type Horse = {
  id: string;
  name: string;
  age: number;
  breed: string;
  description: string;
  photos: string[];
  videos: string[];
  price: number;
};

type Props = {
  horse: Horse;
  onEdit: (horse: Horse) => void;
  onDelete: (id: string) => void;
};

export default function HorseCard({ horse, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow bg-white">
      {horse.photos?.[0] && (
        <Image
          width={300}
          height={200}
          loading="lazy"
          src={horse.photos[0]}
          className="w-full h-40 object-cover rounded"
          alt={horse.name}
        />
      )}
      <h3 className="font-bold mt-2 text-lg">{horse.name}</h3>
      <p className="text-sm text-gray-600">
        {horse.breed} — {horse.age} лет
      </p>
      <p className="text-sm mt-1">{horse.description}</p>
      <p className="text-green-700 font-bold mt-2">
        {horse.price.toLocaleString()} ₸
      </p>
      {horse.videos?.length > 0 && (
        <div className="mt-2 space-y-2">
          {horse.videos.map((url, idx) => (
            <iframe
              loading="lazy"
              key={idx}
              src={url}
              className="w-full h-48 rounded"
              allowFullScreen
            />
          ))}
        </div>
      )}
      <button
        onClick={() => onEdit(horse)}
        className="mt-3 text-blue-600 hover:underline text-sm"
      >
        Редактировать
      </button>
      <button
        onClick={() => onDelete(horse.id)}
        className="ml-3 text-red-600 hover:underline text-sm"
      >
        Удалить
      </button>
    </div>
  );
}
