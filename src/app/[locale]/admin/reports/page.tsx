"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Horse, Payment, Profile } from "@/models";
import { formatPeriod } from "@/utils/formatPeriod";
import AdminNav from "@/components/AdminNav";
import Spinner from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currentMonth = new Date().toISOString().slice(0, 7);

function formatAmount(n: number) {
  return `${n.toLocaleString("ru-RU")} ₸`;
}

export default function AdminReportsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { locale } = useParams();
  const { profile, loading: authLoading } = useAuth();

  const isAdmin = profile?.role === "admin" && profile?.status === "approved";

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, isAdmin, locale, router]);

  // Общие данные — все лошади с владельцем и их владельцы, нужны и
  // отчёту "за период", и справочнику "по лошади".
  const [horses, setHorses] = useState<Horse[]>([]);
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchBase = async () => {
      setListLoading(true);
      const { data: horsesData } = await supabase
        .from("horses")
        .select("*")
        .order("name", { ascending: true });
      const allHorses = (horsesData || []) as Horse[];
      setHorses(allHorses);

      const ownerIds = Array.from(
        new Set(allHorses.map((h) => h.owner_id).filter(Boolean))
      ) as string[];

      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds);
        const map: Record<string, string> = {};
        (profilesData || []).forEach((p) => {
          map[p.id] = (p as Profile).full_name || "Без имени";
        });
        setOwners(map);
      }

      setListLoading(false);
    };
    if (isAdmin) fetchBase();
  }, [isAdmin]);

  // --- Отчёт за период ---
  const [period, setPeriod] = useState(currentMonth);
  const [periodPayments, setPeriodPayments] = useState<Payment[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);

  useEffect(() => {
    const fetchPeriodPayments = async () => {
      setPeriodLoading(true);
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("period", period);
      setPeriodPayments((data || []) as Payment[]);
      setPeriodLoading(false);
    };
    if (isAdmin) fetchPeriodPayments();
  }, [isAdmin, period]);

  const ownedHorses = useMemo(
    () => horses.filter((h) => h.owner_id),
    [horses]
  );

  const periodRows = useMemo(() => {
    const paymentsByHorse = new Map<string, Payment[]>();
    periodPayments.forEach((p) => {
      const list = paymentsByHorse.get(p.horse_id) ?? [];
      list.push(p);
      paymentsByHorse.set(p.horse_id, list);
    });

    return ownedHorses.map((horse) => {
      const payments = paymentsByHorse.get(horse.id) ?? [];
      const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        horse,
        ownerName: owners[horse.owner_id!] || "—",
        payments,
        total,
        paid: payments.length > 0,
      };
    });
  }, [ownedHorses, periodPayments, owners]);

  const periodTotal = periodRows.reduce((sum, r) => sum + r.total, 0);
  const paidCount = periodRows.filter((r) => r.paid).length;
  const unpaidCount = periodRows.length - paidCount;

  // --- История по лошади ---
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [horsePayments, setHorsePayments] = useState<Payment[]>([]);
  const [horseLoading, setHorseLoading] = useState(false);

  useEffect(() => {
    const fetchHorsePayments = async () => {
      if (!selectedHorseId) {
        setHorsePayments([]);
        return;
      }
      setHorseLoading(true);
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("horse_id", selectedHorseId)
        .order("paid_at", { ascending: false });
      setHorsePayments((data || []) as Payment[]);
      setHorseLoading(false);
    };
    fetchHorsePayments();
  }, [selectedHorseId]);

  const horseTotal = horsePayments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (authLoading || !isAdmin) {
    return <Spinner className="min-h-screen" label="Проверяем доступ..." />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-6">Отчёты</h1>

      {listLoading ? (
        <Spinner label="Загружаем данные..." />
      ) : (
        <>
          {/* Отчёт за период */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Оплаты за период</h2>

            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="report-period" className="text-sm font-medium">
                Месяц
              </label>
              <input
                id="report-period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="p-2 border rounded"
              />
            </div>

            {periodLoading ? (
              <Spinner label="Считаем..." />
            ) : ownedHorses.length === 0 ? (
              <p className="text-gray-500">Нет лошадей с назначенным владельцем</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <div className="px-3 py-2 rounded bg-green-50 text-green-800">
                    Оплатили: <strong>{paidCount}</strong>
                  </div>
                  <div className="px-3 py-2 rounded bg-rose-50 text-rose-800">
                    Не оплатили: <strong>{unpaidCount}</strong>
                  </div>
                  <div className="px-3 py-2 rounded bg-gray-100 text-gray-800">
                    Собрано за {formatPeriod(period)}: <strong>{formatAmount(periodTotal)}</strong>
                  </div>
                </div>

                <div className="rounded-lg border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b hover:bg-transparent">
                        <TableHead className="h-12 px-4 font-medium">Лошадь</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Владелец</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Статус</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodRows.map(({ horse, ownerName, total, paid }) => (
                        <TableRow key={horse.id} className="hover:bg-muted/50">
                          <TableCell className="h-14 px-4 font-medium">
                            {horse.name}
                          </TableCell>
                          <TableCell className="h-14 px-4 text-muted-foreground text-sm">
                            {ownerName}
                          </TableCell>
                          <TableCell className="h-14 px-4">
                            {paid ? (
                              <Badge
                                variant="outline"
                                className="border-0 bg-green-500/15 text-green-700"
                              >
                                Оплачено
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-0 bg-rose-500/15 text-rose-700"
                              >
                                Не оплачено
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="h-14 px-4 text-sm">
                            {paid ? formatAmount(total) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </section>

          {/* История по лошади */}
          <section>
            <h2 className="text-xl font-semibold mb-4">История по лошади</h2>

            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="report-horse" className="text-sm font-medium">
                Лошадь
              </label>
              <select
                id="report-horse"
                value={selectedHorseId}
                onChange={(e) => setSelectedHorseId(e.target.value)}
                className="p-2 border rounded flex-1"
              >
                <option value="">Выберите лошадь</option>
                {horses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name}
                    {horse.owner_id ? ` — ${owners[horse.owner_id] || ""}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {!selectedHorseId ? null : horseLoading ? (
              <Spinner label="Загружаем историю..." />
            ) : horsePayments.length === 0 ? (
              <p className="text-gray-500">Платежей по этой лошади нет</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Всего оплачено: <strong>{formatAmount(horseTotal)}</strong>
                </p>
                <div className="rounded-lg border bg-card overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b hover:bg-transparent">
                        <TableHead className="h-12 px-4 font-medium">Дата</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Период</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Сумма</TableHead>
                        <TableHead className="h-12 px-4 font-medium">Примечание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {horsePayments.map((p) => (
                        <TableRow key={p.id} className="hover:bg-muted/50">
                          <TableCell className="h-12 px-4 text-sm text-muted-foreground">
                            {p.paid_at}
                          </TableCell>
                          <TableCell className="h-12 px-4">
                            <Badge variant="secondary">{formatPeriod(p.period)}</Badge>
                          </TableCell>
                          <TableCell className="h-12 px-4 text-sm font-medium">
                            {formatAmount(Number(p.amount))}
                          </TableCell>
                          <TableCell className="h-12 px-4 text-sm text-muted-foreground whitespace-normal">
                            {p.note || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
