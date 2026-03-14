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
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
