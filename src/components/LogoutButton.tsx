"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  const { locale } = useParams();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-800 underline"
    >
      {label}
    </button>
  );
}
