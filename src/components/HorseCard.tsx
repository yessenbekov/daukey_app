import { Horse } from "@/models";
import Image from "next/image";

type Props = {
  horse: Horse;
  onEdit: (horse: Horse) => void;
  onDelete: (id: string) => void;
};

export default function HorseCard({ horse, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-md bg-white relative">
      {horse.photos?.[0] && (
        <div className="relative aspect-video">
          <Image
            src={horse.photos[0]}
            alt={horse.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-bold">{horse.name}</h2>
        <p className="text-sm text-gray-600">
          {horse.breed} — {horse.age} лет
        </p>
        <p className="text-green-700 font-semibold">
          {horse?.price?.toLocaleString("ru-RU")} ₸
        </p>
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
    </div>
  );
}
