"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { ServiceVideo } from "@/models";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";
import VideosTable from "@/components/VideosTable";

const emptyForm = {
  url: "",
  title: "",
  sort_order: "0",
  is_active: true,
};

export default function AdminVideosPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [videos, setVideos] = useState<ServiceVideo[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ServiceVideo | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const fetchVideos = async () => {
    setListLoading(true);
    const { data } = await supabase
      .from("service_videos")
      .select("*")
      .order("sort_order", { ascending: true });
    setVideos((data || []) as ServiceVideo[]);
    setListLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchVideos();
  }, [isAdmin]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingVideo(null);
    setShowForm(false);
  };

  const startEditing = (video: ServiceVideo) => {
    setEditingVideo(video);
    setForm({
      url: video.url,
      title: video.title || "",
      sort_order: String(video.sort_order),
      is_active: video.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      url: form.url.trim(),
      title: form.title.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    const { error } = editingVideo
      ? await supabase
          .from("service_videos")
          .update(payload)
          .eq("id", editingVideo.id)
      : await supabase.from("service_videos").insert(payload);

    if (error) {
      toast.error("Ошибка сохранения");
    } else {
      toast.success(editingVideo ? "Обновлено" : "Видео добавлено");
      resetForm();
      fetchVideos();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("service_videos")
      .delete()
      .eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else {
      toast.success("Удалено");
      fetchVideos();
    }
  };

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <AdminNav />

      <button
        onClick={() => (showForm ? resetForm() : setShowForm(true))}
        className="mb-4 px-4 py-2 bg-black text-white rounded"
      >
        {showForm
          ? "Скрыть форму"
          : editingVideo
          ? "Редактировать видео"
          : "Добавить видео"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200 mb-6"
        >
          <input
            type="text"
            name="url"
            placeholder="Ссылка на Instagram-рилс или YouTube-видео"
            value={form.url}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            name="title"
            placeholder="Название (опционально, только для вас)"
            value={form.title}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <div className="flex items-center gap-4">
            <input
              type="number"
              name="sort_order"
              placeholder="Порядок"
              value={form.sort_order}
              onChange={handleChange}
              className="p-2 border rounded w-32"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Показывать на сайте
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? "bg-gray-500" : "bg-black hover:bg-gray-900"
              }`}
            >
              {editingVideo ? "Сохранить" : "Добавить"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 rounded border"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <h2 className="text-xl font-semibold mb-4">Список видео</h2>
      {listLoading ? (
        <Spinner label="Загружаем видео..." />
      ) : (
        <VideosTable
          videos={videos}
          onEdit={startEditing}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
