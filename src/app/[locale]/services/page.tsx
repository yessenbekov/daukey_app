import { MessageCircleIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Service, ServiceVideo } from "@/models";
import ServicesAccordion from "@/components/ServicesAccordion";
import InstallPrompt from "@/components/InstallPrompt";
import { whatsAppNumber } from "@/utils/constants";
import { toEmbedUrl } from "@/utils/embedUrl";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  const services = (data ?? []) as Service[];

  const { data: videosData } = await supabase
    .from("service_videos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const videos = (videosData ?? []) as ServiceVideo[];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-800 animate-in fade-in duration-500">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 mt-5">
        {t("title")}
      </h1>
      <p className="text-center text-gray-500 text-sm sm:text-base mb-10 leading-relaxed">
        {t("subtitle")}
      </p>

      <ServicesAccordion
        services={services}
        emptyLabel={t("noServicesAvailable")}
      />

      {videos.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {videos.map((video) => (
            <iframe
              key={video.id}
              src={toEmbedUrl(video.url)}
              title={video.title || "video"}
              className="w-full aspect-[9/16] rounded-xl border"
              allowFullScreen
              scrolling="no"
            />
          ))}
        </div>
      )}

      <div className="mt-14 text-center bg-gray-50 py-10 px-4 rounded-xl shadow-inner">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          {t("readyForRidingOrTraining")}
        </h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {t("contactUsForMoreInfo")}
        </p>
        <a
          href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
            "Здравствуйте! Хочу узнать подробнее об услугах клуба."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-900 transition"
        >
          <MessageCircleIcon className="w-5 h-5" />
          {t("writeWhatsapp")}
        </a>
      </div>
      <InstallPrompt />
      <footer className="text-center text-xs text-black mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by{" "}
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-red-600"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </main>
  );
}
