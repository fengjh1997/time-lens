"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WeekGrid from "@/components/grid/WeekGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function WeekContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Calculate current week based on URL offset
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const today = new Date();
  today.setDate(today.getDate() + (offset * 7));
  const monday = getMonday(today);
  
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(formatDate(d));
  }

  const startDate = new Date(weekDates[0]);
  const endDate = new Date(weekDates[6]);
  
  const dateRangeLabel = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`;

  const navigateWeek = (dir: number) => {
    router.push(`/?offset=${offset + dir}`);
  };

  const goToThisWeek = () => {
    router.push(`/?offset=0`);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">一周规划</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">{dateRangeLabel}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={goToThisWeek}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            本周
          </button>
          <div className="flex rounded-full bg-black/5 dark:bg-white/5 p-1 gap-0.5">
            <button 
              onClick={() => navigateWeek(-1)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => navigateWeek(1)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <WeekGrid weekDates={weekDates} />
      </div>
    </div>
  );
}

export default function WeekView() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 font-bold">加载中...</div>}>
      <WeekContent />
    </Suspense>
  );
}
