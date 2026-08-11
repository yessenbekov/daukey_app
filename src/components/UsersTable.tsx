"use client";

import {
  BanIcon,
  CheckIcon,
  Loader2,
  ShieldIcon,
  ShieldOffIcon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
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

type ActionType =
  | "approve"
  | "reject"
  | "promote"
  | "demote"
  | "toggleActive"
  | "toggleShowInMembers";

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
  currentUserId,
  onApprove,
  onReject,
  onPromote,
  onDemote,
  onToggleActive,
  onToggleShowInMembers,
}: {
  users: Profile[];
  currentUserId: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onPromote: (id: string) => Promise<void>;
  onDemote: (id: string) => Promise<void>;
  onToggleActive: (id: string, nextActive: boolean) => Promise<void>;
  onToggleShowInMembers: (id: string, next: boolean) => Promise<void>;
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
            <TableHead className="h-12 px-4 font-medium">Email</TableHead>
            <TableHead className="h-12 px-4 font-medium">Телефон</TableHead>
            <TableHead className="h-12 w-[120px] px-4 font-medium">
              Роль
            </TableHead>
            <TableHead className="h-12 w-[140px] px-4 font-medium">
              Статус
            </TableHead>
            <TableHead className="h-12 w-[200px] px-4 font-medium">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const busy = isBusy(user.id);
            const isSelf = user.id === currentUserId;

            return (
              <TableRow className="hover:bg-muted/50" key={user.id}>
                <TableCell className="h-16 px-4 font-medium">
                  {user.full_name || "—"}
                </TableCell>
                <TableCell className="h-16 px-4 text-muted-foreground text-sm">
                  {user.email || "—"}
                </TableCell>
                <TableCell className="h-16 px-4 text-muted-foreground text-sm">
                  {user.phone || "—"}
                </TableCell>
                <TableCell className="h-16 px-4">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell className="h-16 px-4">
                  <div className="flex flex-col gap-1 items-start">
                    {getStatusBadge(user.status)}
                    {!user.is_active && (
                      <Badge
                        variant="outline"
                        className="border-0 bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20"
                      >
                        Деактивирован
                      </Badge>
                    )}
                  </div>
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
                      {!isSelf && user.role !== "admin" && (
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
                      {!isSelf && user.role === "admin" && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label="Снять роль админа"
                                className="h-8 w-8"
                                disabled={busy}
                                onClick={() =>
                                  runAction(user, "demote", onDemote)
                                }
                                size="icon"
                                variant="outline"
                              />
                            }
                          >
                            {isPending("demote", user.id) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <ShieldOffIcon className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>Снять роль админа</TooltipContent>
                        </Tooltip>
                      )}
                      {!isSelf && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                aria-label={
                                  user.is_active
                                    ? "Деактивировать"
                                    : "Активировать"
                                }
                                className={
                                  user.is_active
                                    ? "h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                                    : "h-8 w-8"
                                }
                                disabled={busy}
                                onClick={() =>
                                  runAction(user, "toggleActive", (id) =>
                                    onToggleActive(id, !user.is_active)
                                  )
                                }
                                size="icon"
                                variant="outline"
                              />
                            }
                          >
                            {isPending("toggleActive", user.id) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : user.is_active ? (
                              <BanIcon className="size-4" />
                            ) : (
                              <UserCheckIcon className="size-4" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.is_active
                              ? "Деактивировать"
                              : "Активировать"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label={
                                user.show_in_members
                                  ? "Убрать из «Члены клуба»"
                                  : "Показывать в «Члены клуба»"
                              }
                              className={
                                user.show_in_members
                                  ? "h-8 w-8 text-blue-600 hover:bg-blue-600 hover:text-white"
                                  : "h-8 w-8"
                              }
                              disabled={busy}
                              onClick={() =>
                                runAction(
                                  user,
                                  "toggleShowInMembers",
                                  (id) =>
                                    onToggleShowInMembers(
                                      id,
                                      !user.show_in_members
                                    )
                                )
                              }
                              size="icon"
                              variant="outline"
                            />
                          }
                        >
                          {isPending("toggleShowInMembers", user.id) ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <UsersIcon className="size-4" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {user.show_in_members
                            ? "Убрать из «Члены клуба»"
                            : "Показывать в «Члены клуба»"}
                        </TooltipContent>
                      </Tooltip>
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
