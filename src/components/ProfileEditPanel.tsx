"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/models";
import { formatPhoneMask } from "@/utils/formatPhone";

export default function ProfileEditPanel({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    birth_date: profile.birth_date ?? "",
    instagram: profile.instagram ?? "",
    whatsapp: profile.whatsapp ?? "",
    telegram: profile.telegram ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: formatPhoneMask(e.target.value) }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const fileName = `${profile.id}/${uuidv4()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);
      if (uploadError) {
        toast.error("Не удалось загрузить фото");
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      finalAvatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        birth_date: form.birth_date || null,
        instagram: form.instagram || null,
        whatsapp: form.whatsapp || null,
        telegram: form.telegram || null,
        avatar_url: finalAvatarUrl,
      })
      .eq("id", profile.id);

    if (error) toast.error("Не удалось сохранить профиль");
    else {
      toast.success("Профиль обновлён");
      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200 mb-8"
    >
      <h2 className="text-xl font-semibold">Мой профиль</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Фото профиля</label>
        <div className="flex items-center gap-4">
          {avatarPreview || avatarUrl ? (
            <Image
              src={avatarPreview || avatarUrl!}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 border" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          disabled
          className="p-2 border rounded w-full bg-gray-100 text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Имя и фамилия
          </label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Телефон</label>
          <input
            type="tel"
            inputMode="numeric"
            name="phone"
            placeholder="+7 702 1234567"
            value={form.phone}
            onChange={handlePhoneChange}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Дата рождения
          </label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input
            name="instagram"
            placeholder="@username"
            value={form.instagram}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input
            name="whatsapp"
            placeholder="+7 ..."
            value={form.whatsapp}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telegram</label>
          <input
            name="telegram"
            placeholder="@username"
            value={form.telegram}
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2 rounded text-white ${
          loading ? "bg-gray-500" : "bg-black hover:bg-gray-900"
        }`}
      >
        {loading ? "Сохраняем..." : "Сохранить"}
      </button>
    </form>
  );
}
