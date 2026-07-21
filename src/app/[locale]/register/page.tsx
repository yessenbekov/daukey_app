"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validation/auth";

export default function RegisterPage() {
  const supabase = createClient();
  const { locale } = useParams();
  const t = useTranslations("authPage");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(
        issue?.message === "passwordMismatch"
          ? t("passwordMismatch")
          : t("genericError")
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
        },
      },
    });

    if (error) {
      toast.error(error.message || t("genericError"));
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    });
  };

  if (submitted) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center">
        <p className="text-lg">{t("registerSuccessPending")}</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-24 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {t("registerTitle")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200"
      >
        <input
          type="text"
          name="fullName"
          placeholder={t("fullNameLabel")}
          value={form.fullName}
          onChange={handleChange}
          required
          className="p-2 border rounded w-full"
        />
        <input
          type="tel"
          name="phone"
          placeholder={t("phoneLabel")}
          value={form.phone}
          onChange={handleChange}
          required
          className="p-2 border rounded w-full"
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder={t("confirmPasswordLabel")}
          value={form.confirmPassword}
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
          {t("registerButton")}
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
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
          {t("alreadyHaveAccount")}{" "}
          <Link href={`/${locale}/login`} className="underline">
            {t("loginButton")}
          </Link>
        </p>
      </form>
    </div>
  );
}
