"use client";

import HorseForm from "@/components/HorseForm";
import HorseCard from "@/components/HorseCard";
import PaymentPanel from "@/components/PaymentPanel";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Horse } from "@/models";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import { useAuth } from "@/context/AuthProvider";

interface Owner {
  id: string;
  full_name: string | null;
}

const emptyForm = {
  name: "",
  year: "",
  breed: "",
  color: "",
  height: "",
  weight: "",
  description: "",
  price: "",
  for_sale: true,
};

export default function AdminHorsesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [ownerId, setOwnerId] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  useEffect(() => {
    fetchHorses();
  }, [search, page]);

  useEffect(() => {
    const fetchOwners = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "owner")
        .eq("status", "approved");
      setOwners((data || []) as Owner[]);
    };
    if (isAdmin) fetchOwners();
  }, [isAdmin]);

  const fetchHorses = async () => {
    setListLoading(true);
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
    setListLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Каждый выбор файлов через input добавляется к уже выбранным, а не
  // заменяет их — иначе повторное открытие проводника (чтобы добавить ещё
  // фото) стирало бы то, что уже было выбрано.
  const handleFileChange = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleVideoChange = (index: number, value: string) => {
    setVideoLinks((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const addVideoField = () => setVideoLinks((prev) => [...prev, ""]);

  const handleRemoveVideo = (index: number) => {
    setVideoLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewPreview = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetFormState = () => {
    setForm(emptyForm);
    setOwnerId("");
    setExistingPhotos([]);
    setFiles([]);
    setPreviews([]);
    setVideoLinks([""]);
  };

  const uploadNewFiles = async () => {
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
    return photoUrls;
  };

  const buildPayload = (uploadedUrls: string[]) => ({
    name: form.name,
    year: Number(form.year),
    breed: form.breed,
    color: form.color || null,
    height: form.height ? Number(form.height) : null,
    weight: form.weight ? Number(form.weight) : null,
    description: form.description,
    price: form.price ? Number(form.price) : null,
    for_sale: form.for_sale,
    photos: [...existingPhotos, ...uploadedUrls],
    videos: videoLinks.filter(Boolean),
    owner_id: ownerId || null,
  });

  const handleAddHorse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const uploadedUrls = await uploadNewFiles();
    const { error } = await supabase.from("horses").insert(buildPayload(uploadedUrls));

    if (error) toast.error("Ошибка добавления");
    else {
      toast.success("Лошадь добавлена");
      router.refresh();
      resetFormState();
      fetchHorses();
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHorse) return;
    setLoading(true);

    const uploadedUrls = await uploadNewFiles();
    const { error } = await supabase
      .from("horses")
      .update(buildPayload(uploadedUrls))
      .eq("id", editingHorse.id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success("Обновлено");
      setEditingHorse(null);
      resetFormState();
      fetchHorses();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;

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
      breed: horse.breed || "",
      color: horse.color || "",
      height: horse.height != null ? String(horse.height) : "",
      weight: horse.weight != null ? String(horse.weight) : "",
      description: horse.description || "",
      price: horse.price != null ? String(horse.price) : "",
      for_sale: horse.for_sale,
    });
    setOwnerId(horse.owner_id || "");
    setVideoLinks(horse.videos?.length ? horse.videos : [""]);
    setExistingPhotos(horse.photos || []);
    setFiles([]);
    setPreviews([]);
    setShowForm(true);
  };

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <AdminNav />
      <input
        type="text"
        placeholder="Поиск по имени"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <button
        onClick={() => {
          if (showForm) {
            setEditingHorse(null);
            resetFormState();
          }
          setShowForm((prev) => !prev);
        }}
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
          existingPhotos={existingPhotos}
          newPreviews={previews}
          videoLinks={videoLinks}
          loading={loading}
          isEdit={!!editingHorse}
          owners={owners}
          ownerId={ownerId}
          onOwnerChange={setOwnerId}
          onChange={handleChange}
          onFileChange={(e) =>
            handleFileChange(e.target.files ? Array.from(e.target.files) : [])
          }
          onRemoveExistingPhoto={handleRemoveExistingPhoto}
          onRemoveNewPreview={handleRemoveNewPreview}
          onVideoChange={handleVideoChange}
          onVideoRemove={handleRemoveVideo}
          onAddVideo={addVideoField}
          onSubmit={editingHorse ? handleUpdate : handleAddHorse}
          onCancel={() => {
            setEditingHorse(null);
            resetFormState();
            setShowForm(false);
          }}
        />
      )}

      <h2 className="text-xl font-semibold mb-4">Список лошадей</h2>
      {listLoading ? (
        <Spinner label="Загружаем лошадей..." />
      ) : horses.length === 0 ? (
        <p className="text-gray-500">Лошади не найдены</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {horses.map((horse) => (
            <div key={horse.id}>
              <HorseCard horse={horse} onEdit={startEditing} onDelete={handleDelete} />
              <div className="border border-t-0 rounded-b-xl -mt-px">
                <PaymentPanel horseId={horse.id} />
              </div>
            </div>
          ))}
        </div>
      )}

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
