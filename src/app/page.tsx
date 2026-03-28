"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import DayGrid from "@/components/grid/DayGrid";
import WeekGrid from "@/components/grid/WeekGrid";
import CanvasTopBar from "@/components/layout/CanvasTopBar";
import { useTimeStore } from "@/store/timeStore";

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
  const { getDayEnergy, getWeekEnergy, settings } = useTimeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = (searchParams.get("view") as TimeView) || "week";
  const view: TimeView = currentView === "day" ? "day" : "week";
  const offset = Number(searchParams.get("offset") || 0);
  const selectedTagIds = (searchParams.get("tags") || "").split(",").filter(Boolean);

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

  const statusLabel =
    view === "day"
      ? `今日 ${getDayEnergy(formatDate(targetDate)).toFixed(settings.decimalPlaces)}`
      : `本周 ${getWeekEnergy(weekDates).toFixed(settings.decimalPlaces)}`;

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <CanvasTopBar
        subtitle={view === "day" ? "时流 · Today / Flow Detail" : "时流 · Week / Motion Canvas"}
        statusLabel={statusLabel}
        onPrev={() => syncRoute(view, offset - 1)}
        onNext={() => syncRoute(view, offset + 1)}
        onReset={() => syncRoute(view, 0)}
      />

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
            {view === "day" ? (
              <DayGrid dateStr={formatDate(targetDate)} selectedTagIds={selectedTagIds} />
            ) : (
              <WeekGrid weekDates={weekDates} selectedTagIds={selectedTagIds} />
            )}
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
