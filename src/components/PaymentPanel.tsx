"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Payment } from "@/models";
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

const currentMonth = new Date().toISOString().slice(0, 7);

export default function PaymentPanel({ horseId }: { horseId: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    period: currentMonth,
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("horse_id", horseId)
      .order("period", { ascending: false })
      .order("paid_at", { ascending: false });
    setPayments((data || []) as Payment[]);
    setPaymentsLoading(false);
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await fetchPayments();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("payments").insert({
      horse_id: horseId,
      amount: Number(form.amount),
      period: form.period || null,
      note: form.note || null,
      created_by: user?.id ?? null,
    });

    if (error) toast.error("Ошибка добавления платежа");
    else {
      toast.success("Платёж добавлен");
      setForm({ amount: "", period: currentMonth, note: "" });
      fetchPayments();
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pb-3">
      <button
        type="button"
        onClick={toggleOpen}
        className="text-xs text-blue-600 hover:underline"
      >
        {open ? "Скрыть платежи" : "Платежи"}
      </button>

      {open && (
        <div className="mt-2 border rounded p-3 bg-gray-50 space-y-2">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
            <input
              type="number"
              placeholder="Сумма"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              className="p-1 border rounded text-sm w-24"
              required
            />
            <input
              type="month"
              value={form.period}
              onChange={(e) =>
                setForm((p) => ({ ...p, period: e.target.value }))
              }
              className="p-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder="Примечание"
              value={form.note}
              onChange={(e) =>
                setForm((p) => ({ ...p, note: e.target.value }))
              }
              className="p-1 border rounded text-sm flex-1 min-w-32"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-black text-white rounded text-sm disabled:opacity-50"
            >
              +
            </button>
          </form>

          {paymentsLoading ? (
            <p className="text-xs text-gray-500">Загружаем...</p>
          ) : payments.length === 0 ? (
            <p className="text-xs text-gray-500">Платежей пока нет</p>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 px-2 text-xs">Дата</TableHead>
                    <TableHead className="h-8 px-2 text-xs">Период</TableHead>
                    <TableHead className="h-8 px-2 text-xs">Сумма</TableHead>
                    <TableHead className="h-8 px-2 text-xs">
                      Примечание
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="h-9 px-2 text-xs text-muted-foreground">
                        {p.paid_at}
                      </TableCell>
                      <TableCell className="h-9 px-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatPeriod(p.period)}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-9 px-2 text-xs font-medium">
                        {p.amount.toLocaleString("ru-RU")} ₸
                      </TableCell>
                      <TableCell className="h-9 px-2 text-xs text-muted-foreground whitespace-normal">
                        {p.note || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
