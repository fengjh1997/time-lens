"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function generateMonthCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let week: Array<number | null> = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

export default function MonthPage() {
  const { blocks, settings } = useTimeStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const weeks = useMemo(() => generateMonthCalendar(year, month), [year, month]);

  const getDailyEnergy = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return Object.entries(blocks)
      .filter(([key]) => key.startsWith(dateStr))
      .map(([, block]) => block)
      .filter((block) => block.status === "completed")
      .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
  };

  const monthEnergy = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) =>
    getDailyEnergy(index + 1),
  ).reduce((sum, energy) => sum + energy, 0);

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6">
        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">Panorama</p>
              <h1 className="mt-2 text-3xl font-black">{year} {MONTH_NAMES[month]}</h1>
              <p className="mt-2 text-sm text-gray-500">
                月视图保留为全景回顾页，但核心操作已经前置到周/日主画布里。
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-black/[0.04] p-1 dark:bg-white/[0.07]">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="rounded-full p-2 hover:bg-white dark:hover:bg-white/10"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-[var(--primary-light)] px-4 py-3">
            <p className="text-[12px] font-black text-[var(--primary-color)]">本月累计</p>
            <p className="mt-1 text-2xl font-black">{monthEnergy.toFixed(settings.decimalPlaces)}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <div className="grid grid-cols-7 gap-3">
            {WEEKDAY_NAMES.map((name) => (
              <div key={name} className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                {name}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-3">
                {week.map((day, dayIndex) => {
                  const energy = day ? getDailyEnergy(day) : 0;
                  const active = !!day && energy !== 0;
                  return (
                    <div
                      key={dayIndex}
                      className={`aspect-square rounded-[24px] border p-3 ${
                        day
                          ? "border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.03]"
                          : "border-transparent bg-transparent"
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor:
                                energy > 0 ? `rgba(var(--primary-rgb), ${Math.min(0.2 + energy / 8, 0.95)})` : "var(--score-punish)",
                              color: energy > 0 ? "white" : "white",
                            }
                          : undefined
                      }
                    >
                      {day && (
                        <>
                          <p className="text-sm font-black">{day}</p>
                          <p className="mt-2 text-[12px] font-bold">{energy.toFixed(settings.decimalPlaces)}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
