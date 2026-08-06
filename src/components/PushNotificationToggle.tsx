"use client";

import { useEffect, useState } from "react";
import { BellIcon, BellOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { urlBase64ToUint8Array } from "@/utils/pushClient";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Status = "unsupported" | "loading" | "subscribed" | "unsubscribed";

// Любой из шагов подписки (запрос системного разрешения, ожидание SW,
// сам pushManager.subscribe) может зависнуть без ответа — без общего
// таймаута на весь процесс кнопка осталась бы задизейбленной навсегда,
// без единого сообщения о причине.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export default function PushNotificationToggle({ userId }: { userId: string }) {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("loading");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        setStatus("unsupported");
        setDebugInfo("serviceWorker недоступен в этом браузере");
        return;
      }
      if (!("PushManager" in window)) {
        setStatus("unsupported");
        setDebugInfo("PushManager недоступен (нужно iOS 16.4+ и установка на экран Домой)");
        return;
      }
      if (!VAPID_PUBLIC_KEY) {
        setStatus("unsupported");
        setDebugInfo("VAPID-ключ не пришёл с сервера");
        return;
      }

      try {
        const registration = await withTimeout(navigator.serviceWorker.ready, 8000);
        const existing = await registration.pushManager.getSubscription();
        setStatus(existing ? "subscribed" : "unsubscribed");
        setDebugInfo(
          `SW: ${registration.active ? "активен" : "не активен"}, permission: ${Notification.permission}`
        );
      } catch (err) {
        console.error("[push] status check failed", err);
        setStatus("unsubscribed");
        setDebugInfo(`Ошибка проверки статуса: ${(err as Error).message}`);
      }
    };

    checkStatus();
  }, []);

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) return;
    setStatus("loading");
    setDebugInfo("Запрашиваем разрешение...");

    try {
      await withTimeout(
        (async () => {
          const permission = await Notification.requestPermission();
          setDebugInfo(`Разрешение: ${permission}`);
          if (permission !== "granted") {
            throw new Error("permission-not-granted:" + permission);
          }

          setDebugInfo("Ждём service worker...");
          const registration = await navigator.serviceWorker.ready;

          setDebugInfo("Подписываемся на push...");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          const json = subscription.toJSON();

          setDebugInfo("Сохраняем подписку в базе...");
          const { error } = await supabase.from("push_subscriptions").upsert(
            {
              user_id: userId,
              endpoint: json.endpoint!,
              p256dh: json.keys!.p256dh,
              auth: json.keys!.auth,
            },
            { onConflict: "endpoint" }
          );

          if (error) throw error;
        })(),
        20000
      );

      toast.success("Уведомления включены");
      setStatus("subscribed");
      setDebugInfo("Подписка сохранена");
    } catch (err) {
      console.error("[push] subscribe failed", err);
      const message = err instanceof Error ? err.message : String(err);
      setDebugInfo(`Ошибка: ${message}`);
      toast.error(
        message === "timeout"
          ? "Не удалось подключиться (таймаут 20с)"
          : message.startsWith("permission-not-granted")
          ? "Уведомления не разрешены в браузере"
          : "Не удалось включить уведомления"
      );
      setStatus("unsubscribed");
    }
  };

  const unsubscribe = async () => {
    setStatus("loading");
    try {
      const registration = await withTimeout(navigator.serviceWorker.ready, 8000);
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", existing.endpoint);
        await existing.unsubscribe();
      }
      toast.success("Уведомления отключены");
      setStatus("unsubscribed");
      setDebugInfo("Отписались");
    } catch (err) {
      console.error("[push] unsubscribe failed", err);
      toast.error("Не удалось отключить уведомления");
      setStatus("subscribed");
      setDebugInfo(`Ошибка отписки: ${(err as Error).message}`);
    }
  };

  if (status === "unsupported") {
    return debugInfo ? (
      <p className="text-xs text-gray-400">{debugInfo}</p>
    ) : null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={status === "subscribed" ? unsubscribe : subscribe}
        disabled={status === "loading"}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        {status === "subscribed" ? (
          <>
            <BellIcon size={16} /> Уведомления включены
          </>
        ) : (
          <>
            <BellOffIcon size={16} />{" "}
            {status === "loading" ? "Проверяем..." : "Включить уведомления"}
          </>
        )}
      </button>
      {debugInfo && <p className="text-xs text-gray-400 mt-1">{debugInfo}</p>}
    </div>
  );
}
