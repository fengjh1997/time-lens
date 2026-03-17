"use client";

import { Star } from "lucide-react";

export default function AppLogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border border-white/35 bg-white/55 text-[var(--primary-color)] shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-white/[0.08] ${
        compact ? "h-10 w-10" : "h-11 w-11"
      }`}
    >
      <div className="absolute inset-[5px] rounded-full bg-[var(--primary-light)]" />
      <Star size={compact ? 16 : 18} className="relative z-10" fill="currentColor" strokeWidth={1.8} />
    </div>
  );
}
