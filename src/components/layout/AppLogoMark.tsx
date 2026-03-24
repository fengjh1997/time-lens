"use client";

import { Star } from "lucide-react";

export default function AppLogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-[18px] border border-white/45 bg-white/70 text-[var(--primary-color)] shadow-[var(--shadow-sm)] dark:border-white/10 dark:bg-white/[0.08] ${
        compact ? "h-11 w-11" : "h-12 w-12"
      }`}
    >
      <div className="absolute inset-[5px] rounded-[14px] bg-[var(--primary-light)]" />
      <Star size={compact ? 16 : 18} className="relative z-10" fill="currentColor" strokeWidth={1.8} />
    </div>
  );
}
