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

function toPeriodInput(period: string | null) {
  return period ?? currentMonth;
}

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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    period: currentMonth,
    paidAt: "",
    note: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const startEdit = (p: Payment) => {
    setEditingId(p.id);
    setEditForm({
      amount: String(p.amount),
      period: toPeriodInput(p.period),
      paidAt: p.paid_at,
      note: p.note ?? "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.amount) return;
    setEditLoading(true);

    const { error } = await supabase
      .from("payments")
      .update({
        amount: Number(editForm.amount),
        period: editForm.period || null,
        paid_at: editForm.paidAt,
        note: editForm.note || null,
      })
      .eq("id", editingId);

    if (error) toast.error("Ошибка сохранения платежа");
    else {
      toast.success("Платёж обновлён");
      setEditingId(null);
      fetchPayments();
    }
    setEditLoading(false);
  };

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
                    <TableHead className="h-8 px-2 text-xs" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) =>
                    editingId === p.id ? (
                      <TableRow key={p.id}>
                        <TableCell colSpan={5} className="p-2">
                          <form
                            onSubmit={handleEditSubmit}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <input
                              type="date"
                              value={editForm.paidAt}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  paidAt: e.target.value,
                                }))
                              }
                              className="p-1 border rounded text-sm"
                              required
                            />
                            <input
                              type="month"
                              value={editForm.period}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  period: e.target.value,
                                }))
                              }
                              className="p-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Сумма"
                              value={editForm.amount}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  amount: e.target.value,
                                }))
                              }
                              className="p-1 border rounded text-sm w-24"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Примечание"
                              value={editForm.note}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  note: e.target.value,
                                }))
                              }
                              className="p-1 border rounded text-sm flex-1 min-w-32"
                            />
                            <button
                              type="submit"
                              disabled={editLoading}
                              className="px-3 py-1 bg-black text-white rounded text-sm disabled:opacity-50"
                            >
                              Сохранить
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1 border rounded text-sm"
                            >
                              Отмена
                            </button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ) : (
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
                        <TableCell className="h-9 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Изменить
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
