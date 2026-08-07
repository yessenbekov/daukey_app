import { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/models";
import LogoutButton from "@/components/LogoutButton";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import DashboardNav from "@/components/DashboardNav";

// Все проверки доступа (залогинен? одобрен? активен?) собраны здесь один
// раз, а не в каждой вкладке — иначе при заходе на /dashboard/notifications
// напрямую (например, по клику из push-уведомления) пришлось бы дублировать
// всю эту логику ещё раз.
export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardPage" });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("closedClubTitle")}</h1>
        <p className="text-gray-600 mb-8">{t("closedClubDescription")}</p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/login`}
            className="px-6 py-2 rounded bg-black text-white hover:bg-gray-900"
          >
            {t("loginButton")}
          </Link>
          <Link
            href={`/${locale}/register`}
            className="px-6 py-2 rounded border hover:bg-gray-50"
          >
            {t("registerButton")}
          </Link>
        </div>
      </div>
    );
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  let profile = profileData as Profile | null;

  if (!profile) {
    // auth.users мог появиться не через обычную регистрацию (signUp), а через
    // привязку уже существующего в общем Supabase-проекте аккаунта к новому
    // провайдеру (например, вход через Google для пользователя kokpar-game/
    // Shezhire) — тогда триггер handle_new_user() не срабатывает, и профиль
    // нужно создать здесь же, при первом заходе в кабинет.
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? null,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
      })
      .select()
      .single();
    profile = created as Profile | null;
  }

  // Вход через Google не даёт телефон (в отличие от обычной формы
  // регистрации, где он обязателен) — пока новый пользователь его не
  // укажет через эту форму, заявку в клуб считаем неподанной. Уже
  // одобренных/отклонённых пользователей это не касается — только тех,
  // кто ещё "pending" и пришёл именно через OAuth.
  if (profile && profile.status === "pending" && !profile.phone) {
    return (
      <CompleteProfileForm profile={profile} email={user.email ?? ""} />
    );
  }

  if (!profile || profile.status !== "approved" || !profile.is_active) {
    return (
      <div className="container max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <p className="mb-6">
          {profile && !profile.is_active
            ? t("statusDeactivated")
            : profile?.status === "rejected"
            ? t("statusRejected")
            : t("statusPending")}
        </p>
        <LogoutButton label={t("logout")} />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <LogoutButton label={t("logout")} />
      </div>
      <DashboardNav />
      {children}
    </div>
  );
}
