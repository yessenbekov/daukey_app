"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Horse } from "@/models";

export default function HorseOwnerEditPanel({ horse }: { horse: Horse }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(horse.price != null ? String(horse.price) : "");
  const [photos, setPhotos] = useState<string[]>(horse.photos || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewFiles(files);
    setNewPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingPhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const makePhotoMain = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let finalPhotos = photos;

    if (newFiles.length > 0 && user) {
      const uploaded: string[] = [];
      for (const file of newFiles) {
        const ext = file.name.split(".").pop();
        const fileName = `owners/${user.id}/${uuidv4()}.${ext}`;
        const { error } = await supabase.storage
          .from("horses")
          .upload(fileName, file);
        if (!error) {
          const { data } = supabase.storage
            .from("horses")
            .getPublicUrl(fileName);
          uploaded.push(data.publicUrl);
        }
      }
      finalPhotos = [...photos, ...uploaded];
    }

    const { error } = await supabase
      .from("horses")
      .update({
        price: price ? Number(price) : null,
        photos: finalPhotos,
      })
      .eq("id", horse.id);

    if (error) {
      toast.error("Не удалось сохранить изменения");
    } else {
      toast.success("Сохранено");
      setPhotos(finalPhotos);
      setNewFiles([]);
      setNewPreviews([]);
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pb-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs text-blue-600 hover:underline"
      >
        {open ? "Скрыть редактирование" : "Изменить цену / фото"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 border rounded p-3 bg-gray-50 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Цена (₸)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Не указана"
              className="p-2 border rounded w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Фото</label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {photos.map((src, idx) => (
                  <div key={src} className="relative group">
                    <Image
                      src={src}
                      alt=""
                      width={120}
                      height={90}
                      className="h-16 w-full object-cover rounded border"
                    />
                    {idx === 0 ? (
                      <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-white rounded px-1 text-[10px]">
                        Главное
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makePhotoMain(idx)}
                        className="absolute bottom-0.5 left-0.5 bg-white/80 rounded px-1 text-[10px] text-blue-700"
                        title="Сделать главной"
                      >
                        Сделать главной
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-white/80 rounded-full px-1.5 text-xs text-red-600"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {newPreviews.map((src, idx) => (
                  <Image
                    key={idx}
                    src={src}
                    alt=""
                    width={120}
                    height={90}
                    className="h-16 w-full object-cover rounded border"
                  />
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-1.5 rounded text-white text-sm ${
              loading ? "bg-gray-500" : "bg-black hover:bg-gray-900"
            }`}
          >
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      )}
    </div>
  );
}
