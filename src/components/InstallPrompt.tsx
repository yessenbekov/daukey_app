"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SquarePlus } from "lucide-react";

function isIOS() {
  return (
    typeof window !== "undefined" &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<null | Event>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    if (isIOS()) {
      setTimeout(() => {
        setShowIosPrompt(true);
      }, 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        setShowInstall(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler as any);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();

    const choiceResult = await promptEvent.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismissIosPrompt = () => {
    setShowIosPrompt(false);
  };

  const handleDismissAndroidPrompt = () => {
    setShowInstall(false);
  };

  return (
    <>
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 inset-x-4 z-50 bg-white/90 backdrop-blur-md text-black px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center md:hidden"
          >
            <p className="text-sm text-center flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-4h2v4zm0-6h-2V7h2v3z" />
              </svg>
              Установите приложение на главный экран
            </p>
            <button
              onClick={handleInstallClick}
              className="bg-black text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-900 transition mb-2"
            >
              Установить
            </button>
            <button
              onClick={handleDismissAndroidPrompt}
              className="text-sm text-gray-600 underline"
            >
              Понятно
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIosPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 inset-x-4 z-50 bg-white border border-yellow-500 text-black px-5 py-4 rounded-2xl shadow-2xl flex flex-col items-center md:hidden"
          >
            <div className="mb-2">
              <Image
                src="/images/logo.svg"
                alt="App logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <p className="text-sm text-center mb-2 font-medium">
              Чтобы установить приложение, нажмите
              <span className="font-semibold mx-1">Поделиться</span>и выберите
              <span className="font-semibold mx-1">Добавить на экран</span>
            </p>
            <SquarePlus className="w-32 rounded shadow mb-2" />

            <button
              onClick={handleDismissIosPrompt}
              className="text-sm text-gray-600 underline"
            >
              Понятно
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
