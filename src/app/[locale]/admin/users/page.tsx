"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Profile, ProfileStatus } from "@/models";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";
import UsersTable from "@/components/UsersTable";

export default function AdminUsersPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<ProfileStatus | "all">("pending");
  const [listLoading, setListLoading] = useState(true);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const fetchUsers = async () => {
    setListLoading(true);
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query;
    setUsers((data || []) as Profile[]);
    setListLoading(false);
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

  const demoteFromAdmin = async (id: string) => {
    if (!confirm("Снять роль администратора у этого пользователя?")) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: "owner" })
      .eq("id", id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success("Роль администратора снята");
      fetchUsers();
    }
  };

  const toggleActive = async (id: string, nextActive: boolean) => {
    if (
      !confirm(
        nextActive
          ? "Активировать аккаунт этого пользователя?"
          : "Деактивировать аккаунт этого пользователя? Он потеряет доступ в личный кабинет."
      )
    )
      return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: nextActive })
      .eq("id", id);

    if (error) toast.error("Ошибка обновления");
    else {
      toast.success(nextActive ? "Аккаунт активирован" : "Аккаунт деактивирован");
      fetchUsers();
    }
  };

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <AdminNav />
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

      {listLoading ? (
        <Spinner label="Загружаем пользователей..." />
      ) : (
        <UsersTable
          users={users}
          currentUserId={profile?.id ?? ""}
          onApprove={(id) => updateStatus(id, "approved")}
          onReject={(id) => updateStatus(id, "rejected")}
          onPromote={promoteToAdmin}
          onDemote={demoteFromAdmin}
          onToggleActive={toggleActive}
        />
      )}
    </div>
  );
}
