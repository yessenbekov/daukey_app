import Image from "next/image";
import React from "react";

interface Props {
  form: {
    name: string;
    age: string;
    breed: string;
    description: string;
    price: string;
  };
  previews: string[];
  videoLinks: string[];
  loading: boolean;
  isEdit?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoChange: (index: number, value: string) => void;
  onVideoRemove: (index: number) => void;
  onPreviewRemove: (index: number) => void;
  onAddVideo: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
}

export default function HorseForm({
  form,
  previews,
  videoLinks,
  loading,
  isEdit = false,
  onChange,
  onFileChange,
  onVideoChange,
  onVideoRemove,
  onPreviewRemove,
  onAddVideo,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-6 border border-gray-200"
    >
      <h2 className="text-xl font-semibold">
        {isEdit ? "Редактировать лошадь" : "Добавить лошадь"}
      </h2>

      {/* Базовая информация */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Имя"
          className="p-2 border rounded w-full"
          value={form.name}
          onChange={onChange}
        />
        <input
          name="age"
          placeholder="Возраст"
          type="number"
          className="p-2 border rounded w-full"
          value={form.age}
          onChange={onChange}
        />
        <input
          name="breed"
          placeholder="Порода"
          className="p-2 border rounded w-full"
          value={form.breed}
          onChange={onChange}
        />
        <input
          name="price"
          placeholder="Цена (₸)"
          type="number"
          className="p-2 border rounded w-full"
          value={form.price}
          onChange={onChange}
        />
      </div>

      {/* Описание */}
      <textarea
        name="description"
        placeholder="Описание"
        className="w-full p-2 border rounded"
        value={form.description}
        onChange={onChange}
        rows={3}
      />

      {/* Фото */}
      <div>
        <label className="block font-medium mb-2">Фотографии</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          className="w-full p-2 border rounded"
        />
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group">
                <Image
                  width={300}
                  height={200}
                  loading="lazy"
                  src={src}
                  alt={`preview-${idx}`}
                  className="h-32 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => onPreviewRemove(idx)}
                  className="absolute top-1 right-1 bg-white/80 rounded-full px-2 text-sm text-red-600 opacity-0 group-hover:opacity-100 transition"
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Видео */}
      <div>
        <label className="block font-medium mb-2">Ссылки на видео</label>
        {videoLinks.map((link, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={link}
              onChange={(e) => onVideoChange(i, e.target.value)}
              placeholder={`https://youtube.com/...`}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => onVideoRemove(i)}
              className="text-sm text-red-600"
              title="Удалить видео"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddVideo}
          className="text-sm text-blue-600 hover:underline"
        >
          + Добавить ещё видео
        </button>
      </div>

      {/* Кнопки */}
      <div className="flex justify-between items-center pt-4 flex-wrap gap-3">
        {onCancel && isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-600 underline"
          >
            Отменить
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-black hover:bg-gray-900"
          }`}
        >
          {loading
            ? isEdit
              ? "Сохраняем..."
              : "Добавляем..."
            : isEdit
            ? "Сохранить изменения"
            : "Добавить"}
        </button>
      </div>
    </form>
  );
}
