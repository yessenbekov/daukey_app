import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return NextResponse.json(
    {
      name: t("title"),
      short_name: t("title"),
      description: t("description"),
      start_url: "/",
      display: "standalone",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/desktop.png",
          sizes: "1280x800",
          type: "image/png",
          form_factor: "wide",
        },
        {
          src: "/screenshots/mobile.png",
          sizes: "750x1334",
          type: "image/png",
          form_factor: "narrow",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
