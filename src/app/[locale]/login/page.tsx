"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations("authPage");

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(t("genericError"));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      toast.error(t("loginError"));
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    });
  };

  return (
    <div className="container max-w-md mx-auto py-24 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t("loginTitle")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200"
      >
        <input
          type="email"
          name="email"
          placeholder={t("emailLabel")}
          value={form.email}
          onChange={handleChange}
          required
          className="p-2 border rounded w-full"
        />
        <input
          type="password"
          name="password"
          placeholder={t("passwordLabel")}
          value={form.password}
          onChange={handleChange}
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
          {t("loginButton")}
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="h-px flex-1 bg-gray-200" />
          {t("orDivider")}
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-6 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          {t("continueWithGoogle")}
        </button>

        <p className="text-center text-sm">
          {t("noAccountYet")}{" "}
          <Link href={`/${locale}/register`} className="underline">
            {t("registerButton")}
          </Link>
        </p>
      </form>
    </div>
  );
}
