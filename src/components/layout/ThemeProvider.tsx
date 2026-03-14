"use client";

import { useEffect, useState } from "react";
import { useTimeStore } from "@/store/timeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useTimeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      
      // Theme Management
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Primary Color Management
      const colorClasses = ['theme-amber', 'theme-emerald', 'theme-violet', 'theme-blue'];
      root.classList.remove(...colorClasses);
      root.classList.add(`theme-${settings.primaryColor}`);
    }
  }, [settings.theme, settings.primaryColor, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
