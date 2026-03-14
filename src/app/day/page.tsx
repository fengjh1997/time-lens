"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DayGrid from "@/components/grid/DayGrid";

function DayContent() {
  const searchParams = useSearchParams();
  const dateStr = searchParams.get('date') || "2026-03-16";
  
  // Parse for display
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dayName = dayNames[dateObj.getDay()];
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">今日焦点</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">{year}年{month}月{day}日 {dayName}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95">
            今天
          </button>
          <div className="flex rounded-full bg-black/5 dark:bg-white/5 p-1 gap-0.5">
            <button className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">加载中...</div>}>
      <DayContent />
    </Suspense>
  );
}
