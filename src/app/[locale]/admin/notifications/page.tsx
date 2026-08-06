"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthProvider";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!confirm("Отправить push-уведомление всем подписанным пользователям?")) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/${locale}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || `/${locale}/dashboard`,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Ошибка отправки");
      } else {
        toast.success(`Отправлено ${result.sent} из ${result.total}`);
        setTitle("");
        setBody("");
        setUrl("");
      }
    } catch {
      toast.error("Ошибка отправки");
    }
    setSending(false);
  };

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-6">Push-уведомление</h1>

      <form
        onSubmit={handleSend}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200"
      >
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="p-2 border rounded w-full"
        />
        <textarea
          placeholder="Текст сообщения (необязательно)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Ссылка при нажатии (необязательно, по умолчанию — личный кабинет)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button
          type="submit"
          disabled={sending}
          className={`px-6 py-2 rounded text-white ${
            sending ? "bg-gray-500" : "bg-black hover:bg-gray-900"
          }`}
        >
          {sending ? "Отправляем..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}
