import ProfileCard from "@/components/ProfileCard";
import { Section } from "@/components/Section";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("homePage"); // Указываем namespace
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/alone.jpeg')" }}
    >
      <div className="p-6 max-w-4xl w-full text-center">
        <h2 className="text-xl font-semibold mb-4">{t("socialMedia")}</h2>
        <div className="flex justify-center gap-6">
          <a
            href="https://instagram.com/daukey_kokpar_club"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white rounded-2xl p-6 hover:bg-red-50 transition"
          >
            <img
              src="/icons/instagram.svg"
              alt="instagram"
              className="w-20 h-20"
            />
          </a>
          <a
            href="https://www.tiktok.com/@daukey.kokpar.club"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white rounded-2xl p-6 hover:bg-red-50 transition"
          >
            <img src="/icons/tiktok.svg" alt="tiktok" className="w-20 h-20" />
          </a>
        </div>
      </div>

      <div className="mt-8 space-y-4 w-90 max-w-4xl">
        <a
          href="https://wa.me/77001234567"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white flex items-center justify-between px-6 py-4 text-white rounded-2xl shadow hover:bg-green-600 transition"
        >
          <div className="flex items-center gap-4">
            <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">WhatsApp</p>
              <p className="text-sm">{t("writeToWpp")}</p>
            </div>
          </div>
          <span className="text-2xl">›</span>
        </a>

        <a
          href="https://t.me/your_telegram_username"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white flex items-center justify-between px-6 py-4 text-white rounded-2xl shadow hover:bg-blue-600 transition"
        >
          <div className="flex items-center gap-4">
            <img src="/icons/telegram.svg" alt="Telegram" className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Telegram</p>
              <p className="text-sm">{t("writeToTG")}</p>
            </div>
          </div>
          <span className="text-2xl">›</span>
        </a>
      </div>

      <div className="mt-10">
        <h2 className="text-xl text-white font-semibold mb-2">{t("location")}</h2>
        <div className="flex items-center gap-4 mb-4 bg-gray-100 p-4 rounded-xl">
          <MapPin className="text-gray-600" />
          <div>
            <p className="font-semibold">
              Almaty, Сагадат Нурмагамбетов, 230/1
            </p>
            <p className="text-sm text-gray-500">{t("workTime")}</p>
          </div>
        </div>
        <div className="space-y-3">
          <a
            href="https://go.2gis.com/Y45kg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-gray-100 px-4 py-3 rounded-xl hover:bg-gray-200"
          >
            <span className="flex items-center gap-2">
              <img src="/icons/2gis.svg" alt="2gis" className="w-35 h-10" />
            </span>
          </a>
          <a
            href="https://maps.app.goo.gl/yDgemn1svCj2w9mx6"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center bg-gray-100 px-4 py-3 rounded-xl hover:bg-gray-200"
          >
            <span className="flex items-center gap-2">
              <img
                src="/icons/google-maps.svg"
                alt="google-maps"
                className="w-14 h-14"
              />
              <span>Google Maps</span>
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
