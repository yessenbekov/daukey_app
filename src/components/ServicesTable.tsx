"use client";

import { Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Service } from "@/models";

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₸`;
}

export default function ServicesTable({
  services,
  onEdit,
  onDelete,
}: {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const runDelete = async (service: Service) => {
    if (!confirm(`Удалить услугу «${service.name}»?`)) return;
    setDeletingId(service.id);
    await onDelete(service.id);
    setDeletingId(null);
  };

  if (services.length === 0) {
    return <p className="text-gray-500">Услуги не найдены</p>;
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="h-12 px-4 font-medium">Категория</TableHead>
            <TableHead className="h-12 px-4 font-medium">Название</TableHead>
            <TableHead className="h-12 px-4 font-medium">Цена</TableHead>
            <TableHead className="h-12 px-4 font-medium">Ед.</TableHead>
            <TableHead className="h-12 w-[100px] px-4 font-medium">
              Статус
            </TableHead>
            <TableHead className="h-12 w-[120px] px-4 font-medium">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow className="hover:bg-muted/50" key={service.id}>
              <TableCell className="h-16 px-4 text-muted-foreground text-sm">
                {service.category}
              </TableCell>
              <TableCell className="h-16 px-4 font-medium">
                {service.name}
              </TableCell>
              <TableCell className="h-16 px-4">
                {formatPrice(service.price)}
              </TableCell>
              <TableCell className="h-16 px-4 text-muted-foreground text-sm">
                {service.unit || "—"}
              </TableCell>
              <TableCell className="h-16 px-4">
                {service.is_active ? (
                  <Badge
                    variant="outline"
                    className="border-0 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                  >
                    Активна
                  </Badge>
                ) : (
                  <Badge variant="secondary">Скрыта</Badge>
                )}
              </TableCell>
              <TableCell className="h-16 px-4">
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Редактировать"
                            className="h-8 w-8"
                            onClick={() => onEdit(service)}
                            size="icon"
                            variant="outline"
                          />
                        }
                      >
                        <PencilIcon className="size-4" />
                      </TooltipTrigger>
                      <TooltipContent>Редактировать</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Удалить"
                            className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                            disabled={deletingId === service.id}
                            onClick={() => runDelete(service)}
                            size="icon"
                            variant="outline"
                          />
                        }
                      >
                        {deletingId === service.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <TrashIcon className="size-4" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>Удалить</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
