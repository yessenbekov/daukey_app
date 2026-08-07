"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Training, TrainingResponse, TrainingRsvp } from "@/models";
import Spinner from "@/components/Spinner";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrainingRsvpBoard({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const supabase = createClient();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [rsvpsByTraining, setRsvpsByTraining] = useState<
    Record<string, TrainingRsvp[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: trainingsData } = await supabase
      .from("trainings")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(10);

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

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vote = async (trainingId: string, response: TrainingResponse) => {
    setVoting(trainingId);
    const { error } = await supabase.from("training_rsvps").upsert(
      {
        training_id: trainingId,
        user_id: userId,
        full_name: fullName,
        response,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "training_id,user_id" }
    );

    if (error) toast.error("Не удалось сохранить голос");
    else await fetchData();
    setVoting(null);
  };

  if (loading) return <Spinner label="Загружаем тренировки..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ближайшие тренировки</h2>

      {trainings.length === 0 ? (
        <p className="text-gray-500">Пока нет запланированных тренировок</p>
      ) : (
        trainings.map((training) => {
          const rsvps = rsvpsByTraining[training.id] || [];
          const yes = rsvps.filter((r) => r.response === "yes");
          const no = rsvps.filter((r) => r.response === "no");
          const myVote = rsvps.find((r) => r.user_id === userId)?.response;
          const busy = voting === training.id;

          return (
            <div
              key={training.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <p className="font-semibold">{training.title}</p>
              <p className="text-sm text-gray-500 mb-3 capitalize">
                {formatDateTime(training.starts_at)}
              </p>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => vote(training.id, "yes")}
                  className={`flex-1 px-4 py-2 rounded font-medium transition ${
                    myVote === "yes"
                      ? "bg-green-700 text-white"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  + Приду
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => vote(training.id, "no")}
                  className={`flex-1 px-4 py-2 rounded font-medium transition ${
                    myVote === "no"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  − Не приду
                </button>
              </div>

              <div className="text-sm space-y-1">
                <p className="text-green-700">
                  ✅ Придут ({yes.length}):{" "}
                  {yes.map((r) => r.full_name).join(", ") || "—"}
                </p>
                {no.length > 0 && (
                  <p className="text-gray-500">
                    ❌ Не придут ({no.length}):{" "}
                    {no.map((r) => r.full_name).join(", ")}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
