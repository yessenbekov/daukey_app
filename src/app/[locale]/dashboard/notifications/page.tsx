import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/models";
import TrainingRsvpBoard from "@/components/TrainingRsvpBoard";
import PushNotificationToggle from "@/components/PushNotificationToggle";

export default async function DashboardNotificationsPage() {
  const supabase = await createClient();

  // Доступ уже проверен в layout.tsx.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as Profile | null;
  if (!profile) return null;

  return (
    <div>
      <div className="mb-6">
        <PushNotificationToggle userId={user.id} />
      </div>

      <TrainingRsvpBoard
        userId={user.id}
        fullName={profile.full_name || user.email || "Участник"}
      />
    </div>
  );
}
