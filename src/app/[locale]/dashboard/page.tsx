import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Horse, Payment, Profile } from "@/models";
import HorseOwnerEditPanel from "@/components/HorseOwnerEditPanel";
import ProfileEditPanel from "@/components/ProfileEditPanel";
import LogoutButton from "@/components/LogoutButton";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import { formatPeriod } from "@/utils/formatPeriod";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <LogoutButton label={t("logout")} />
      </div>

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
                    <div className="rounded-md border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="h-9 px-3 text-xs">
                              {t("paidAt")}
                            </TableHead>
                            <TableHead className="h-9 px-3 text-xs">
                              {t("period")}
                            </TableHead>
                            <TableHead className="h-9 px-3 text-xs">
                              {t("amount")}
                            </TableHead>
                            <TableHead className="h-9 px-3 text-xs">
                              {t("note")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {horsePayments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="px-3 text-sm text-muted-foreground">
                                {p.paid_at}
                              </TableCell>
                              <TableCell className="px-3">
                                <Badge variant="secondary">
                                  {formatPeriod(p.period)}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 text-sm font-medium">
                                {p.amount.toLocaleString("ru-RU")} ₸
                              </TableCell>
                              <TableCell className="px-3 text-sm text-muted-foreground">
                                {p.note || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
