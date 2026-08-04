import { ReactNode } from "react";
import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import RegisterSW from "@/components/RegisterSW";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/context/AuthProvider";

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const detectedLocale = locale || "ru";
  const messages = await getMessages({ locale: detectedLocale });

  return (
    <html lang={detectedLocale}>
      <head>
        <link rel="manifest" href={`/${detectedLocale}/manifest.webmanifest`} />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${golosText.className} ${golosText.variable}`}>
        <NextIntlClientProvider locale={detectedLocale} messages={messages}>
          <SpeedInsights />
          <Toaster position="top-right" />
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
