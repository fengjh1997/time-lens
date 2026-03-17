"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayGrid from "@/components/grid/DayGrid";
import FocusScopeSwitcher from "@/components/layout/FocusScopeSwitcher";
import AppLogoMark from "@/components/layout/AppLogoMark";
import CanvasUtilityPanels from "@/components/layout/CanvasUtilityPanels";

function DayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const current = new Date(`${dateStr}T00:00:00`);

  const moveDay = (offset: number) => {
    const next = new Date(current);
    next.setDate(current.getDate() + offset);
    router.push(`/day?date=${next.toISOString().split("T")[0]}`);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
        <div className="glass-panel flex items-center justify-between gap-2 rounded-[28px] px-3 py-3 sm:px-4">
          <AppLogoMark compact />
          <FocusScopeSwitcher />
          <CanvasUtilityPanels />
          <div className="glass-card flex items-center gap-1 rounded-full p-1">
            <button
              type="button"
              onClick={() => moveDay(-1)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="前一天"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => router.push(`/day?date=${new Date().toISOString().split("T")[0]}`)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="今天"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary-color)]" />
            </button>
            <button
              type="button"
              onClick={() => moveDay(1)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="后一天"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <DayGrid dateStr={dateStr} />
      </div>
    </div>
  );
}

export default function DayView() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-faint">加载中...</div>}>
      <DayContent />
    </Suspense>
  );
}
