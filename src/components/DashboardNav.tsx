"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function DashboardNav() {
  const { locale } = useParams();
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}/dashboard`, label: "Профиль", exact: true },
    { href: `/${locale}/dashboard/notifications`, label: "Уведомления", exact: false },
  ];

  return (
    <div className="flex gap-2 mb-6 border-b overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
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
