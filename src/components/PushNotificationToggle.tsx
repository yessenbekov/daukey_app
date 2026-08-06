"use client";

import { useEffect, useState } from "react";
import { BellIcon, BellOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { urlBase64ToUint8Array } from "@/utils/pushClient";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Status = "unsupported" | "loading" | "subscribed" | "unsubscribed";

// navigator.serviceWorker.ready может зависнуть навсегда (например, если
// регистрация SW в RegisterSW.tsx по какой-то причине не удалась) — без
// таймаута кнопка осталась бы задизейбленной бесконечно, без единого
// сообщения о причине.
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

  useEffect(() => {
    const checkStatus = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        setStatus("unsupported");
        return;
      }

      try {
        const registration = await withTimeout(navigator.serviceWorker.ready, 8000);
        const existing = await registration.pushManager.getSubscription();
        setStatus(existing ? "subscribed" : "unsubscribed");
      } catch (err) {
        console.error("[push] status check failed", err);
        setStatus("unsubscribed");
      }
    };

    checkStatus();
  }, []);

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) return;
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Уведомления не разрешены в браузере");
        setStatus("unsubscribed");
        return;
      }

      const registration = await withTimeout(navigator.serviceWorker.ready, 8000);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = subscription.toJSON();

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

      toast.success("Уведомления включены");
      setStatus("subscribed");
    } catch (err) {
      console.error("[push] subscribe failed", err);
      toast.error(
        err instanceof Error && err.message === "timeout"
          ? "Не удалось подключиться к service worker (таймаут)"
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
    } catch (err) {
      console.error("[push] unsubscribe failed", err);
      toast.error("Не удалось отключить уведомления");
      setStatus("subscribed");
    }
  };

  if (status === "unsupported") return null;

  return (
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
          <BellOffIcon size={16} /> Включить уведомления
        </>
      )}
    </button>
  );
}
