"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayGrid from "@/components/grid/DayGrid";

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
      <header className="sticky top-0 z-20 border-b border-[var(--border-color)] glass-panel px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">Day View</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">
              {current.getFullYear()}.{String(current.getMonth() + 1).padStart(2, "0")}.{String(current.getDate()).padStart(2, "0")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/day?date=${new Date().toISOString().split("T")[0]}`)}
              className="rounded-full bg-black/[0.04] px-4 py-2 text-[13px] font-black text-gray-600 dark:bg-white/[0.07] dark:text-gray-300"
            >
              今天
            </button>
            <div className="flex items-center gap-1 rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.07]">
              <button type="button" onClick={() => moveDay(-1)} className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => moveDay(1)} className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10">
                <ChevronRight size={16} />
              </button>
            </div>
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
    <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-400">Loading...</div>}>
      <DayContent />
    </Suspense>
  );
}
