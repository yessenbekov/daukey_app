// models/profile.ts
export type ProfileRole = "owner" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  is_active: boolean;
  created_at: string;
  birth_date: string | null;
  instagram: string | null;
  whatsapp: string | null;
  telegram: string | null;
  avatar_url: string | null;
  show_in_members: boolean;
}

export interface ClubMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  instagram: string | null;
  whatsapp: string | null;
  telegram: string | null;
}
