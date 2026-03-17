"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import DayGrid from "@/components/grid/DayGrid";
import WeekGrid from "@/components/grid/WeekGrid";
import ViewSwitcher, { type TimeView } from "@/components/layout/ViewSwitcher";

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
    if (view === "day") {
      next.setDate(today.getDate() + offset);
    } else {
      next.setDate(today.getDate() + offset * 7);
    }
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

  const title =
    view === "day"
      ? `${targetDate.getFullYear()}.${String(targetDate.getMonth() + 1).padStart(2, "0")}.${String(targetDate.getDate()).padStart(2, "0")}`
      : `${weekDates[0]} - ${weekDates[6]}`;

  const syncRoute = (nextView: TimeView, nextOffset: number) => {
    router.replace(`/?view=${nextView}&offset=${nextOffset}`);
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-color)] glass-panel px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">Focus Canvas</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">周/日主画布</h1>
            <p className="mt-1 text-sm text-gray-500">{title}</p>
          </div>

          <div className="flex items-center gap-3">
            <ViewSwitcher
              currentView={view}
              onViewChange={(nextView) => {
                syncRoute(nextView, offset);
              }}
            />
            <button
              type="button"
              onClick={() => syncRoute(view, 0)}
              className="rounded-full bg-black/[0.04] px-4 py-2 text-[13px] font-black text-gray-600 dark:bg-white/[0.07] dark:text-gray-300"
            >
              回到当前
            </button>
            <div className="flex items-center gap-1 rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.07]">
              <button
                type="button"
                onClick={() => syncRoute(view, offset - 1)}
                className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => syncRoute(view, offset + 1)}
                className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${offset}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
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
    <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
