import { ReactNode } from "react";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import RegisterSW from "@/components/RegisterSW";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Daukey App",
  description: "Продажа лошадей онлайн",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const detectedLocale = params.locale || "ru";
  const messages = await getMessages({ locale: detectedLocale });

  return (
    <html lang={detectedLocale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={detectedLocale} messages={messages}>
          <Toaster position="top-right" />
          <Navbar />
          {children}
        </NextIntlClientProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
