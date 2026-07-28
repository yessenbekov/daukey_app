"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/models";
import LogoutButton from "@/components/LogoutButton";

export default function CompleteProfileForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("id", profile.id);

    if (error) {
      toast.error("Ошибка сохранения");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Заявка отправлена</h1>
        <p className="text-gray-600 mb-8">
          Администраторы клуба свяжутся с вами в ближайшее время.
        </p>
        <LogoutButton label="Выйти" />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-24 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Завершите регистрацию</h1>
        <LogoutButton label="Выйти" />
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Вы вошли через Google. Укажите телефон, чтобы подать заявку на
        членство в клубе.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200"
      >
        <input
          type="text"
          placeholder="ФИО"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="p-2 border rounded w-full"
        />
        <input
          type="email"
          value={email}
          disabled
          className="p-2 border rounded w-full bg-gray-100 text-gray-500"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="p-2 border rounded w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-2 rounded text-white ${
            loading ? "bg-gray-500" : "bg-black hover:bg-gray-900"
          }`}
        >
          Отправить заявку
        </button>
      </form>
    </div>
  );
}
