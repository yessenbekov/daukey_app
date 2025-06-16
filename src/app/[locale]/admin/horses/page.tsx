"use client";

import HorseForm from "@/components/HorseForm";
import HorseCard from "@/components/HorseCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Horse } from "@/models";
import { ITEMS_PER_PAGE } from "@/utils/constants";

export default function AdminHorsesPage() {
  const [form, setForm] = useState({
    name: "",
    year: "",
    breed: "",
    description: "",
    price: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  useEffect(() => {
    fetchHorses();
  }, [search, page]);

  const fetchHorses = async () => {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("horses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) query = query.ilike("name", `%${search}%`);

    const { data, count } = await query;
    setHorses(data || []);
    if (count !== null) setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: File[]) => {
    setFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleVideoChange = (index: number, value: string) => {
    setVideoLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const addVideoField = () => setVideoLinks((prev) => [...prev, ""]);

  const handleRemoveVideo = (index: number) => {
    setVideoLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePreview = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHorse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("Пожалуйста, добавьте хотя бы одну фотографию");
      return;
    }

    setLoading(true);
    const photoUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${ext}`;
      const { error } = await supabase.storage
        .from("horses")
        .upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from("horses").getPublicUrl(fileName);
        photoUrls.push(data.publicUrl);
      }
    }

    const { error } = await supabase.from("horses").insert({
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      photos: photoUrls,
      videos: videoLinks.filter(Boolean),
      is_available: true,
    });

    if (error) toast.error("Ошибка добавления");
    else {
      toast.success("Лошадь добавлена");
      router.refresh();
      setForm({ name: "", year: "", breed: "", description: "", price: "" });
      setFiles([]);
      setPreviews([]);
      setVideoLinks([""]);
      fetchHorses();
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHorse) return;
    setLoading(true);
    let photoUrls = editingHorse.photos || [];

    if (files.length) {
      photoUrls = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${ext}`;
        const { error } = await supabase.storage
          .from("horses")
          .upload(fileName, file);
        if (!error) {
          const { data } = supabase.storage
            .from("horses")
            .getPublicUrl(fileName);
          photoUrls.push(data.publicUrl);
        }
      }
    }

    const { error } = await supabase
      .from("horses")
      .update({
        ...form,
        age: Number(form.year),
        price: Number(form.price),
        photos: photoUrls,
        videos: videoLinks.filter(Boolean),
      })
      .eq("id", editingHorse.id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success("Обновлено");
      setEditingHorse(null);
      setForm({ name: "", year: "", breed: "", description: "", price: "" });
      setFiles([]);
      setPreviews([]);
      setVideoLinks([""]);
      fetchHorses();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;

    console.log("Удаление:", id);
    const { error } = await supabase.from("horses").delete().eq("id", id);
    if (!error) {
      toast.success("Удалено");
      fetchHorses();
    }
  };

  const startEditing = (horse: Horse) => {
    setEditingHorse(horse);
    setForm({
      name: horse.name,
      year: String(horse.year),
      breed: horse.breed,
      description: horse.description,
      price: String(horse.price),
    });
    setVideoLinks(horse.videos || [""]);
    setPreviews(horse.photos || []);
    setShowForm(true);
  };

  return (
    <div className="container max-w-4xl py-10">
      <input
        type="text"
        placeholder="Поиск по имени"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-15 mb-4 p-2 border rounded w-full"
      />

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-black text-white rounded"
      >
        {showForm
          ? "Скрыть форму"
          : editingHorse
          ? "Редактировать лошадь"
          : "Добавить лошадь"}
      </button>

      {showForm && (
        <HorseForm
          form={form}
          previews={previews}
          videoLinks={videoLinks}
          loading={loading}
          isEdit={!!editingHorse}
          onChange={handleChange}
          onFileChange={(e) =>
            handleFileChange(e.target.files ? Array.from(e.target.files) : [])
          }
          onVideoChange={handleVideoChange}
          onVideoRemove={handleRemoveVideo}
          onPreviewRemove={handleRemovePreview}
          onAddVideo={addVideoField}
          onSubmit={editingHorse ? handleUpdate : handleAddHorse}
          onCancel={() => {
            setEditingHorse(null);
            setShowForm(false);
          }}
        />
      )}

      <h2 className="text-xl font-semibold mb-4">Список лошадей</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {horses.map((horse) => (
          <HorseCard
            key={horse.id}
            horse={horse}
            onEdit={startEditing}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Назад
        </button>
        <span className="px-4 py-2 text-sm font-medium text-gray-700">
          Страница {page} из {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Вперед
        </button>
      </div>
    </div>
  );
}
