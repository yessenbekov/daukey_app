import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { PushSubscriptionRow } from "@/models";

export async function POST(request: Request) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json(
      { error: "Push notifications are not configured" },
      { status: 500 }
    );
  }

  const { title, body, url } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // RLS на push_subscriptions разрешает select только is_admin() — если
  // вызвал не админ, здесь просто окажется пустой список и рассылка
  // молча ничего не отправит (без отдельной проверки роли).
  const { data, error } = await supabase.from("push_subscriptions").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subscriptions = (data || []) as PushSubscriptionRow[];

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({ title, body, url: url || "/" });

  let sent = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({
    sent,
    total: subscriptions.length,
    removed: expiredEndpoints.length,
  });
}
