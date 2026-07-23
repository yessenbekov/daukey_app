"use client";

import { CheckIcon, Loader2, ShieldIcon, XIcon } from "lucide-react";
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
import { Profile, ProfileStatus } from "@/models";

type ActionType = "approve" | "reject" | "promote";

function getStatusBadge(status: ProfileStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-0 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
        >
          Ожидает
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="border-0 bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
        >
          Одобрен
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="border-0 bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
        >
          Отклонён
        </Badge>
      );
  }
}

function getRoleBadge(role: Profile["role"]) {
  return role === "admin" ? (
    <Badge
      variant="outline"
      className="border-0 bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
    >
      Admin
    </Badge>
  ) : (
    <Badge variant="secondary">Владелец</Badge>
  );
}

export default function UsersTable({
  users,
  onApprove,
  onReject,
  onPromote,
}: {
  users: Profile[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onPromote: (id: string) => Promise<void>;
}) {
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: ActionType;
  } | null>(null);

  const isPending = (type: ActionType, id: string) =>
    pendingAction?.id === id && pendingAction.type === type;

  const isBusy = (id: string) => pendingAction?.id === id;

  const runAction = async (
    user: Profile,
    type: ActionType,
    action: (id: string) => Promise<void>
  ) => {
    setPendingAction({ id: user.id, type });
    await action(user.id);
    setPendingAction(null);
  };

  if (users.length === 0) {
    return <p className="text-gray-500">Нет пользователей</p>;
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="h-12 px-4 font-medium">Имя</TableHead>
            <TableHead className="h-12 px-4 font-medium">Телефон</TableHead>
            <TableHead className="h-12 w-[120px] px-4 font-medium">
              Роль
            </TableHead>
            <TableHead className="h-12 w-[120px] px-4 font-medium">
              Статус
            </TableHead>
            <TableHead className="h-12 w-[160px] px-4 font-medium">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const busy = isBusy(user.id);

            return (
              <TableRow className="hover:bg-muted/50" key={user.id}>
                <TableCell className="h-16 px-4 font-medium">
                  {user.full_name || "—"}
                </TableCell>
                <TableCell className="h-16 px-4 text-muted-foreground text-sm">
                  {user.phone || "—"}
                </TableCell>
                <TableCell className="h-16 px-4">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell className="h-16 px-4">
                  {getStatusBadge(user.status)}
                </TableCell>
                <TableCell className="h-16 px-4">
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      {user.status !== "approved" && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label="Одобрить"
                                className="h-8 w-8"
                                disabled={busy}
                                onClick={() =>
                                  runAction(user, "approve", onApprove)
                                }
                                size="icon"
                                variant="outline"
                              />
                            }
                          >
                            {isPending("approve", user.id) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckIcon className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Одобрить</TooltipContent>
                        </Tooltip>
                      )}
                      {user.status !== "rejected" && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label="Отклонить"
                                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                                disabled={busy}
                                onClick={() =>
                                  runAction(user, "reject", onReject)
                                }
                                size="icon"
                                variant="outline"
                              />
                            }
                          >
                            {isPending("reject", user.id) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <XIcon className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Отклонить</TooltipContent>
                        </Tooltip>
                      )}
                      {user.role !== "admin" && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label="Сделать админом"
                                className="h-8 w-8"
                                disabled={busy}
                                onClick={() =>
                                  runAction(user, "promote", onPromote)
                                }
                                size="icon"
                                variant="outline"
                              />
                            }
                          >
                            {isPending("promote", user.id) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <ShieldIcon className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Сделать админом</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
