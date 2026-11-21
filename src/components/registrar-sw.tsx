"use client";

import { useEffect } from "react";

/** Registra o service worker do PWA (só em produção, para não atrapalhar o dev). */
export function RegistrarSW() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha ao registrar o SW não deve quebrar o app.
      });
    }
  }, []);

  return null;
}
