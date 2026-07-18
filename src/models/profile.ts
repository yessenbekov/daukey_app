// models/profile.ts
export type ProfileRole = "owner" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  created_at: string;
}
