"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Service } from "@/models";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₸`;
}

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

export default function ServicesAccordion({
  services,
  emptyLabel,
}: {
  services: Service[];
  emptyLabel: string;
}) {
  // Группируем по нормализованному ключу категории (без учёта регистра и
  // пробелов) — иначе "Кокпар" и "кокпар", введённые админом в разных
  // карточках, попадут в два разных раздела вместо одного. Заголовок при
  // этом берём из первой встреченной записи, чтобы сохранить оригинальный
  // регистр.
  const groups = new Map<string, { label: string; items: Service[] }>();
  services.forEach((service) => {
    const key = normalizeCategory(service.category);
    const group = groups.get(key);
    if (group) group.items.push(service);
    else groups.set(key, { label: service.category, items: [service] });
  });

  const categories = Array.from(groups.entries());
  const [expanded, setExpanded] = useState<string[]>(
    categories.map(([key]) => key)
  );

  const toggle = (key: string) => {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  if (categories.length === 0) {
    return <p className="text-center text-gray-500">{emptyLabel}</p>;
  }

  return (
    <section className="space-y-6">
      {categories.map(([key, group]) => {
        const isOpen = expanded.includes(key);
        const panelId = `services-panel-${key.replace(/\s+/g, "-")}`;

        return (
          <div
            key={key}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              className="w-full text-left p-5 sm:p-6 flex justify-between items-center text-lg sm:text-xl font-semibold"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span>{group.label}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {isOpen && (
              <div id={panelId} className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableBody>
                      {group.items.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="align-top">
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {service.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap align-top">
                            <div className="font-semibold">
                              {formatPrice(service.price)}
                            </div>
                            {service.unit && (
                              <Badge variant="secondary" className="mt-1">
                                {service.unit}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
