"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker зарегистрирован"))
        .catch((err) => console.error("❌ Ошибка регистрации SW", err));
    }
  }, []);

  return null;
}
