import Image from "next/image";
import { redirect } from "next/navigation";
import { Instagram, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClubMember, Profile } from "@/models";

function calcAge(birthDate: string | null) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // Вкладка пока доступна только админам. Доступ к самим данным уже
  // стережёт is_admin() внутри get_club_members(), но не-админа лучше
  // сразу увести на главную, а не показать пустой список.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();
  const profile = profileData as Profile | null;
  const isAdmin = profile?.role === "admin" && profile?.status === "approved";
  if (!isAdmin) redirect(`/${locale}`);

  const { data } = await supabase.rpc("get_club_members");
  const members = (data || []) as ClubMember[];

  return (
    <div className="container max-w-6xl mx-auto py-10 pt-24">
      <h1 className="text-3xl font-bold mb-6">Члены клуба</h1>

      {members.length === 0 ? (
        <p className="text-gray-500">Пока нет одобренных членов клуба</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((member) => {
            const age = calcAge(member.birth_date);
            return (
              <div
                key={member.id}
                className="border rounded-xl p-4 bg-white shadow-sm flex items-center gap-3"
              >
                {member.avatar_url ? (
                  <Image
                    src={member.avatar_url}
                    alt=""
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 border shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {member.full_name || "Без имени"}
                  </p>
                  {age != null && (
                    <p className="text-sm text-gray-500">{age} лет</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    {member.instagram && (
                      <a
                        href={`https://instagram.com/${member.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600"
                        title="Instagram"
                      >
                        <Instagram size={16} />
                      </a>
                    )}
                    {member.whatsapp && (
                      <a
                        href={`https://wa.me/${member.whatsapp.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-600"
                        title="WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    )}
                    {member.telegram && (
                      <a
                        href={`https://t.me/${member.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                        title="Telegram"
                      >
                        <Send size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
