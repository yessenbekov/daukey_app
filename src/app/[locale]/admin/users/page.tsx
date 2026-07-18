"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Profile, ProfileStatus } from "@/models";

export default function AdminUsersPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<ProfileStatus | "all">("pending");

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const fetchUsers = async () => {
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query;
    setUsers((data || []) as Profile[]);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, filter]);

  const updateStatus = async (id: string, status: ProfileStatus) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success("Обновлено");
      fetchUsers();
    }
  };

  const promoteToAdmin = async (id: string) => {
    if (!confirm("Сделать этого пользователя администратором?")) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin", status: "approved" })
      .eq("id", id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success("Пользователь стал администратором");
      fetchUsers();
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-10 mt-15">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>

      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {users.length === 0 && (
          <p className="text-gray-500">Нет пользователей</p>
        )}
        {users.map((u) => (
          <div
            key={u.id}
            className="border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 bg-white"
          >
            <div>
              <p className="font-semibold">{u.full_name || "—"}</p>
              <p className="text-sm text-gray-600">{u.phone || "—"}</p>
              <p className="text-xs text-gray-500">
                {u.role} · {u.status}
              </p>
            </div>
            <div className="flex gap-2">
              {u.status !== "approved" && (
                <button
                  onClick={() => updateStatus(u.id, "approved")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Одобрить
                </button>
              )}
              {u.status !== "rejected" && (
                <button
                  onClick={() => updateStatus(u.id, "rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Отклонить
                </button>
              )}
              {u.role !== "admin" && (
                <button
                  onClick={() => promoteToAdmin(u.id)}
                  className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
                >
                  Сделать админом
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
