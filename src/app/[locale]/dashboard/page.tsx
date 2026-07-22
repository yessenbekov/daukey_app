import { redirect } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Horse, Payment, Profile } from "@/models";
import HorseOwnerEditPanel from "@/components/HorseOwnerEditPanel";
import ProfileEditPanel from "@/components/ProfileEditPanel";
import { formatPeriod } from "@/utils/formatPeriod";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboardPage" });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
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
        full_name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
      })
      .select()
      .single();
    profile = created as Profile | null;
  }

  if (!profile || profile.status !== "approved") {
    return (
      <div className="container max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <p>
          {profile?.status === "rejected"
            ? t("statusRejected")
            : t("statusPending")}
        </p>
      </div>
    );
  }

  const { data: horsesData } = await supabase
    .from("horses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const horses = (horsesData ?? []) as Horse[];

  const horseIds = horses.map((h) => h.id);

  const { data: paymentsData } =
    horseIds.length > 0
      ? await supabase
          .from("payments")
          .select("*")
          .in("horse_id", horseIds)
          .order("paid_at", { ascending: false })
      : { data: [] };
  const payments = (paymentsData ?? []) as Payment[];

  const paymentsByHorse = new Map<string, Payment[]>();
  payments.forEach((p) => {
    const list = paymentsByHorse.get(p.horse_id) ?? [];
    list.push(p);
    paymentsByHorse.set(p.horse_id, list);
  });

  return (
    <div className="container max-w-4xl mx-auto py-24 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      <ProfileEditPanel profile={profile} email={user.email ?? ""} />

      <h2 className="text-xl font-semibold mb-4">{t("myHorses")}</h2>

      {horses.length === 0 ? (
        <p className="text-gray-500">{t("noHorses")}</p>
      ) : (
        <div className="space-y-6">
          {horses.map((horse) => {
            const horsePayments = paymentsByHorse.get(horse.id) ?? [];

            return (
              <div
                key={horse.id}
                className="border rounded-xl overflow-hidden shadow-md bg-white"
              >
                <div className="flex gap-4 p-4">
                  {horse.photos?.[0] && (
                    <Image
                      src={horse.photos[0]}
                      alt={horse.name}
                      width={128}
                      height={96}
                      className="w-32 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{horse.name}</h3>
                    <p className="text-sm text-gray-600">
                      {horse.breed} — {horse.year}
                    </p>
                    {horse.price != null && (
                      <p className="text-sm text-green-700 font-semibold">
                        {horse.price.toLocaleString("ru-RU")} ₸
                      </p>
                    )}
                  </div>
                </div>

                <HorseOwnerEditPanel horse={horse} />

                <div className="border-t px-4 py-3">
                  <h4 className="font-semibold mb-2">
                    {t("paymentsHistory")}
                  </h4>
                  {horsePayments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {t("noPayments")}
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-1">{t("paidAt")}</th>
                          <th className="py-1">{t("amount")}</th>
                          <th className="py-1">{t("period")}</th>
                          <th className="py-1">{t("note")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {horsePayments.map((p) => (
                          <tr key={p.id} className="border-t">
                            <td className="py-1">{p.paid_at}</td>
                            <td className="py-1">
                              {p.amount.toLocaleString("ru-RU")} ₸
                            </td>
                            <td className="py-1">{formatPeriod(p.period)}</td>
                            <td className="py-1">{p.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
