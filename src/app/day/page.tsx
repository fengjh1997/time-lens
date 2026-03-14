"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DayGrid from "@/components/grid/DayGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

function DayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  // Parse for display
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dayName = dayNames[dateObj.getDay()];
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  const navigateDay = (offset: number) => {
    const nextDate = new Date(dateObj);
    nextDate.setDate(nextDate.getDate() + offset);
    const y = nextDate.getFullYear();
    const m = (nextDate.getMonth() + 1).toString().padStart(2, '0');
    const d = nextDate.getDate().toString().padStart(2, '0');
    const nextDateStr = `${y}-${m}-${d}`;
    router.push(`/day?date=${nextDateStr}`);
  };

  const goToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    router.push(`/day?date=${todayStr}`);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">今日焦点</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">{year}年{month}月{day}日 {dayName}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={goToToday}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            今天
          </button>
          <div className="flex rounded-full bg-black/5 dark:bg-white/5 p-1 gap-0.5">
            <button 
              onClick={() => navigateDay(-1)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => navigateDay(1)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white"
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
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 font-bold">加载中...</div>}>
      <DayContent />
    </Suspense>
  );
}
