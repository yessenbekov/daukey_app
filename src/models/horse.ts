// models/horse.ts
export interface Horse {
  id: string;
  name: string;
  breed: string;
  color: string;
  height: number; // в см
  weight: number; // в кг
  description: string;
  photos: string[]; // URL'ы на изображения
  videos: string[]; // YouTube ссылки
  price?: number; // опционально
  status?: string;
  year: number;
  owner_id?: string | null;
}
