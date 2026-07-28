"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Service } from "@/models";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";
import ServicesTable from "@/components/ServicesTable";

const emptyForm = {
  category: "",
  name: "",
  description: "",
  price: "",
  unit: "",
  sort_order: "0",
  is_active: true,
};

export default function AdminServicesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const fetchServices = async () => {
    setListLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    setServices((data || []) as Service[]);
    setListLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchServices();
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
    setEditingService(null);
    setShowForm(false);
  };

  const startEditing = (service: Service) => {
    setEditingService(service);
    setForm({
      category: service.category,
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      unit: service.unit || "",
      sort_order: String(service.sort_order),
      is_active: service.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      category: form.category.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      unit: form.unit.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    const { error } = editingService
      ? await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id)
      : await supabase.from("services").insert(payload);

    if (error) {
      toast.error("Ошибка сохранения");
    } else {
      toast.success(editingService ? "Обновлено" : "Услуга добавлена");
      resetForm();
      fetchServices();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else {
      toast.success("Удалено");
      fetchServices();
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
          : editingService
          ? "Редактировать услугу"
          : "Добавить услугу"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200 mb-6"
        >
          <input
            type="text"
            name="category"
            placeholder="Категория (например, Верховая езда)"
            value={form.category}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            name="name"
            placeholder="Название услуги"
            value={form.name}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
          <textarea
            name="description"
            placeholder="Описание (опционально)"
            value={form.description}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            rows={2}
          />
          <div className="flex gap-4">
            <input
              type="number"
              name="price"
              placeholder="Цена, ₸"
              value={form.price}
              onChange={handleChange}
              required
              min={0}
              step="0.01"
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              name="unit"
              placeholder="Ед. (за визит, в месяц...)"
              value={form.unit}
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
          </div>
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
              {editingService ? "Сохранить" : "Добавить"}
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

      <h2 className="text-xl font-semibold mb-4">Список услуг</h2>
      {listLoading ? (
        <Spinner label="Загружаем услуги..." />
      ) : (
        <ServicesTable
          services={services}
          onEdit={startEditing}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
