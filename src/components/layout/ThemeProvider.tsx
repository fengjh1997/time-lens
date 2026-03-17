"use client";

import { useEffect } from "react";
import { useTimeStore } from "@/store/timeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useTimeStore();

  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const colorClasses = ["theme-amber", "theme-emerald", "theme-violet", "theme-blue"];
    root.classList.remove(...colorClasses);
    root.classList.add(`theme-${settings.primaryColor}`);
  }, [settings.primaryColor, settings.theme]);

  return <>{children}</>;
}
