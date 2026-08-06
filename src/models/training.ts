// models/training.ts
export interface Training {
  id: string;
  title: string;
  starts_at: string;
  created_by: string | null;
  created_at: string;
}

export type TrainingResponse = "yes" | "no";

export interface TrainingRsvp {
  id: string;
  training_id: string;
  user_id: string;
  full_name: string;
  response: TrainingResponse;
  created_at: string;
  updated_at: string;
}
