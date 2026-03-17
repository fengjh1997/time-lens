"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DayGrid from "@/components/grid/DayGrid";
import WeekGrid from "@/components/grid/WeekGrid";
import FocusScopeSwitcher from "@/components/layout/FocusScopeSwitcher";
import AppLogoMark from "@/components/layout/AppLogoMark";
import CanvasUtilityPanels from "@/components/layout/CanvasUtilityPanels";

type TimeView = "day" | "week";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getMonday(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = (searchParams.get("view") as TimeView) || "week";
  const view: TimeView = currentView === "day" ? "day" : "week";
  const offset = Number(searchParams.get("offset") || 0);

  const targetDate = useMemo(() => {
    const today = new Date();
    const next = new Date(today);
    next.setDate(today.getDate() + (view === "day" ? offset : offset * 7));
    return next;
  }, [offset, view]);

  const weekDates = useMemo(() => {
    const monday = getMonday(targetDate);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return formatDate(date);
    });
  }, [targetDate]);

  const syncRoute = (nextView: TimeView, nextOffset: number) => {
    router.replace(`/?view=${nextView}&offset=${nextOffset}`);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
        <div className="glass-panel flex items-center justify-between gap-2 rounded-[28px] px-3 py-3 sm:px-4">
          <AppLogoMark compact />
          <FocusScopeSwitcher />
          <CanvasUtilityPanels />
          <div className="glass-card flex items-center gap-1 rounded-full p-1">
            <button
              type="button"
              onClick={() => syncRoute(view, offset - 1)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="上一段"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => syncRoute(view, 0)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="回到当前"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary-color)]" />
            </button>
            <button
              type="button"
              onClick={() => syncRoute(view, offset + 1)}
              className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
              aria-label="下一段"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${offset}`}
            initial={{ opacity: 0, y: 14, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.24 }}
            className="h-full"
          >
            {view === "day" ? <DayGrid dateStr={formatDate(targetDate)} /> : <WeekGrid weekDates={weekDates} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-faint">加载中...</div>}>
      <HomeContent />
    </Suspense>
  );
}
