// models/service.ts
export interface Service {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
