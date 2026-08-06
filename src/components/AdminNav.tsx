"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function AdminNav() {
  const { locale } = useParams();
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}/admin/horses`, label: "Лошади" },
    { href: `/${locale}/admin/services`, label: "Услуги" },
    { href: `/${locale}/admin/videos`, label: "Видео" },
    { href: `/${locale}/admin/trainings`, label: "Тренировки" },
    { href: `/${locale}/admin/notifications`, label: "Уведомления" },
    { href: `/${locale}/admin/users`, label: "Пользователи" },
  ];

  return (
    <div
      className="flex gap-2 mb-6 border-b overflow-x-auto"
      style={{ marginTop: "60px" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 whitespace-nowrap ${
              isActive
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
