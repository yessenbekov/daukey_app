"use client";

import { socialLinks, whatsAppNumber } from "@/utils/constants";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import InstallPrompt from "@/components/InstallPrompt";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

export default function Home() {
  const t = useTranslations("homePage");

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/alone.jpeg')" }}
    >
      <motion.div
        className="p-6 max-w-4xl w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2
          className="text-xl font-semibold mt-15 mb-4 text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          {t("socialMedia")}
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mt-6">
          {socialLinks.map(({ href, label, icon }, index) => (
            <BlurFade key={label} delay={0.1 + index * 0.05}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                <MagicCard
                  className="flex flex-col items-center justify-center p-4 rounded-2xl"
                  surfaceClassName="bg-white/10 backdrop-blur-sm"
                  baseColor="transparent"
                  gradientColor="#ffffff"
                  gradientOpacity={0.15}
                  gradientFrom="#b88b4a"
                  gradientTo="#f5f1e3"
                >
                  {icon}
                  <p className="text-white text-sm font-medium mt-2 min-h-[1.5rem] text-center">
                    {label}
                  </p>
                </MagicCard>
              </a>
            </BlurFade>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-10 px-4 w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2
          className="text-xl font-semibold mb-4 text-white text-center"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          {t("location")}
        </h2>

        <MagicCard
          className="rounded-2xl"
          surfaceClassName="bg-black/40 backdrop-blur-md"
          baseColor="transparent"
          gradientColor="#ffffff"
          gradientOpacity={0.1}
          gradientFrom="#b88b4a"
          gradientTo="#f5f1e3"
        >
          <div className="flex items-start gap-4 p-4 shadow-md text-white">
            <div className="mt-1">
              <MapPin className="text-white" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-base leading-tight">
                Almaty, Сагадат Нұрмагамбетов, 230/1
              </p>
              <p className="text-sm text-white/80">🕒 10:00 – 20:00</p>
              <p className="text-sm text-white/60 italic">
                {t("workTime")} {/* например: Жұма – демалыс күні */}
              </p>
            </div>
          </div>
        </MagicCard>

        <div className="space-y-3 mt-5">
          <a href="https://go.2gis.com/Y45kg" target="_blank" rel="noopener noreferrer">
            <MagicCard
              className="rounded-2xl"
              surfaceClassName="bg-black/40 backdrop-blur-md"
          baseColor="transparent"
              gradientColor="#ffffff"
              gradientOpacity={0.1}
              gradientFrom="#b88b4a"
              gradientTo="#f5f1e3"
            >
              <div className="flex items-center justify-between px-5 py-4 shadow-md text-white transition group">
                <img src="/icons/2gis.svg" alt="2GIS" className="h-8" />
                <span className="text-white text-xl transform transition-transform group-hover:translate-x-1">
                  ›
                </span>
              </div>
            </MagicCard>
          </a>

          <a
            href="https://maps.app.goo.gl/yDgemn1svCj2w9mx6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MagicCard
              className="rounded-2xl"
              surfaceClassName="bg-black/40 backdrop-blur-md"
          baseColor="transparent"
              gradientColor="#ffffff"
              gradientOpacity={0.1}
              gradientFrom="#b88b4a"
              gradientTo="#f5f1e3"
            >
              <div className="flex items-center justify-between px-5 py-4 shadow-md text-white transition group">
                <div className="flex items-center gap-3">
                  <img
                    src="/icons/google-maps.svg"
                    alt="Google Maps"
                    className="w-10 h-10"
                  />
                  <span className="text-white text-base">Google Maps</span>
                </div>
                <span className="text-white text-xl transform transition-transform group-hover:translate-x-1">
                  ›
                </span>
              </div>
            </MagicCard>
          </a>
        </div>
      </motion.div>

      <div className="mt-10 mb-5 px-4 w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md text-white text-center p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-2">{t("wannaKnowMore")}</h3>
          <p className="mb-4 text-sm text-white/80">
            {t("contactUsForMoreInfo")}
          </p>
          <ShimmerButton
            onClick={() =>
              window.open(`https://wa.me/${whatsAppNumber}`, "_blank")
            }
            background="rgba(22, 163, 74, 1)"
            shimmerColor="#ffffff"
            className="mx-auto"
          >
            {t("writeToWpp")}
          </ShimmerButton>
        </div>
      </div>

      <InstallPrompt />
      <footer className="text-center text-xs text-white/60 mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by{" "}
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </main>
  );
}
