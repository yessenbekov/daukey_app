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
      className={`space-y-4 ${
        isEdit ? "bg-yellow-50" : "bg-white"
      } p-6 rounded-xl shadow-md mb-10`}
    >
      <h2 className="text-xl font-semibold">
        {isEdit ? "Редактировать лошадь" : "Добавить лошадь"}
      </h2>
      <input
        name="name"
        placeholder="Имя"
        className="w-full p-2 border rounded"
        value={form.name}
        onChange={onChange}
      />
      <input
        name="age"
        placeholder="Возраст"
        type="number"
        className="w-full p-2 border rounded"
        value={form.age}
        onChange={onChange}
      />
      <input
        name="breed"
        placeholder="Порода"
        className="w-full p-2 border rounded"
        value={form.breed}
        onChange={onChange}
      />
      <textarea
        name="description"
        placeholder="Описание"
        className="w-full p-2 border rounded"
        value={form.description}
        onChange={onChange}
      />
      <input
        name="price"
        placeholder="Цена (₸)"
        type="number"
        className="w-full p-2 border rounded"
        value={form.price}
        onChange={onChange}
      />
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Ссылки на видео</p>
        {videoLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link}
              onChange={(e) => onVideoChange(i, e.target.value)}
              placeholder={`Видео ${i + 1}`}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => onVideoRemove(i)}
              className="text-sm text-red-600"
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
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          multiple
          className="w-full p-2 border rounded"
        />
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  loading="lazy"
                  src={src}
                  alt={`preview-${idx}`}
                  className="h-32 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => onPreviewRemove(idx)}
                  className="absolute top-1 right-1 bg-white/70 rounded-full px-2 text-sm text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading
          ? isEdit
            ? "Сохраняем..."
            : "Добавляем..."
          : isEdit
          ? "Сохранить изменения"
          : "Добавить"}
      </button>
      {isEdit && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="ml-4 text-sm text-gray-600 underline"
        >
          Отменить
        </button>
      )}
    </form>
  );
}
