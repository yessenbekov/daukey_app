"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TrashIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Training, TrainingRsvp } from "@/models";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTrainingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [rsvpsByTraining, setRsvpsByTraining] = useState<
    Record<string, TrainingRsvp[]>
  >({});
  const [listLoading, setListLoading] = useState(true);
  const [title, setTitle] = useState("Кокпар");
  const [startsAt, setStartsAt] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const fetchTrainings = async () => {
    setListLoading(true);
    const { data: trainingsData } = await supabase
      .from("trainings")
      .select("*")
      .order("starts_at", { ascending: false });

    const list = (trainingsData || []) as Training[];
    setTrainings(list);

    if (list.length > 0) {
      const { data: rsvpsData } = await supabase
        .from("training_rsvps")
        .select("*")
        .in(
          "training_id",
          list.map((t) => t.id)
        );

      const grouped: Record<string, TrainingRsvp[]> = {};
      (rsvpsData || []).forEach((rsvp) => {
        const r = rsvp as TrainingRsvp;
        grouped[r.training_id] = [...(grouped[r.training_id] || []), r];
      });
      setRsvpsByTraining(grouped);
    } else {
      setRsvpsByTraining({});
    }

    setListLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchTrainings();
  }, [isAdmin]);

  const notifyAboutTraining = async (trainingTitle: string, iso: string) => {
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trainingTitle,
          body: `${formatDateTime(iso)} — отметьтесь, придёте?`,
          url: `/${locale}/dashboard`,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Уведомление отправлено (${result.sent} из ${result.total})`);
      }
    } catch {
      // Уведомление — best effort: тренировка уже создана и видна в
      // приложении, даже если рассылка push не удалась.
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startsAt) return;
    setSaving(true);

    const finalTitle = title.trim() || "Кокпар";
    const iso = new Date(startsAt).toISOString();

    const { error } = await supabase.from("trainings").insert({
      title: finalTitle,
      starts_at: iso,
      created_by: profile?.id,
    });

    if (error) toast.error("Ошибка создания");
    else {
      toast.success("Тренировка создана");
      setStartsAt("");
      fetchTrainings();
      notifyAboutTraining(finalTitle, iso);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тренировку?")) return;
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else {
      toast.success("Удалено");
      fetchTrainings();
    }
  };

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-6">Тренировки</h1>

      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200 mb-8"
      >
        <h2 className="text-lg font-semibold">Новая тренировка</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-2 rounded text-white ${
            saving ? "bg-gray-500" : "bg-black hover:bg-gray-900"
          }`}
        >
          {saving ? "Создаём..." : "Создать"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Список тренировок</h2>
      {listLoading ? (
        <Spinner label="Загружаем тренировки..." />
      ) : trainings.length === 0 ? (
        <p className="text-gray-500">Тренировок пока нет</p>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => {
            const rsvps = rsvpsByTraining[training.id] || [];
            const yes = rsvps.filter((r) => r.response === "yes");
            const no = rsvps.filter((r) => r.response === "no");
            const isPast = new Date(training.starts_at) < new Date();

            return (
              <div
                key={training.id}
                className={`border rounded-xl p-4 bg-white ${
                  isPast ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{training.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(training.starts_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(training.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Удалить"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-green-700">
                    ✅ Придут ({yes.length}):{" "}
                    {yes.map((r) => r.full_name).join(", ") || "—"}
                  </p>
                  <p className="text-gray-500">
                    ❌ Не придут ({no.length}):{" "}
                    {no.map((r) => r.full_name).join(", ") || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
