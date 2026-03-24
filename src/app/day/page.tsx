"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DayGrid from "@/components/grid/DayGrid";
import CanvasTopBar from "@/components/layout/CanvasTopBar";
import { useTimeStore } from "@/store/timeStore";

function DayContent() {
  const { getDayEnergy, settings } = useTimeStore();
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
      <CanvasTopBar
        subtitle="时流 · Today / Flow Detail"
        statusLabel={`今日 ${getDayEnergy(dateStr).toFixed(settings.decimalPlaces)}`}
        onPrev={() => moveDay(-1)}
        onNext={() => moveDay(1)}
        onReset={() => router.push(`/day?date=${new Date().toISOString().split("T")[0]}`)}
      />

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
