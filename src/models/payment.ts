// models/payment.ts
export interface Payment {
  id: string;
  horse_id: string;
  amount: number;
  period: string | null;
  paid_at: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}
