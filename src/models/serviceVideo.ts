// models/serviceVideo.ts
export interface ServiceVideo {
  id: string;
  url: string;
  title: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
