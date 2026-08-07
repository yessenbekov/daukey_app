import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Horse, Payment, Profile } from "@/models";
import HorseOwnerEditPanel from "@/components/HorseOwnerEditPanel";
import ProfileEditPanel from "@/components/ProfileEditPanel";
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

  // Доступ уже проверен в layout.tsx — сюда рендерится только когда
  // пользователь залогинен и одобрен, так что здесь просто берём данные.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile) return null;

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
    <>
      <ProfileEditPanel profile={profile} email={user.email ?? ""} />

      <h2 className="text-xl font-semibold mb-4 mt-6">{t("myHorses")}</h2>

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
                              <TableCell className="px-3 text-sm text-muted-foreground whitespace-normal">
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
    </>
  );
}
