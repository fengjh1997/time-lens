"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";
import FocusScopeSwitcher from "@/components/layout/FocusScopeSwitcher";

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const VISIBLE_TAG_COUNT = 6;

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

function MonthContent() {
  const { blocks, settings, tags } = useTimeStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const scope = searchParams.get("scope") === "year" ? "year" : "month";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showMoreTags, setShowMoreTags] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const weeks = useMemo(() => generateMonthCalendar(year, month), [year, month]);
  const visibleTags = showMoreTags ? tags : tags.slice(0, VISIBLE_TAG_COUNT);

  const activeTags = selectedTagIds.length > 0;
  const isIncluded = (tagId?: string) => !activeTags || (!!tagId && selectedTagIds.includes(tagId));

  const getDailyEnergy = (dateStr: string) =>
    Object.entries(blocks)
      .filter(([key]) => key.startsWith(dateStr))
      .map(([, block]) => block)
      .filter((block) => block.status === "completed" && isIncluded(block.tagId))
      .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);

  const monthEnergy = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
    return getDailyEnergy(dateStr);
  }).reduce((sum, energy) => sum + energy, 0);

  const yearMonths = Array.from({ length: 12 }, (_, monthIndex) => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const days = Array.from({ length: lastDay.getDate() }, (_, index) => {
      const date = new Date(firstDay);
      date.setDate(index + 1);
      const dateStr = date.toISOString().split("T")[0];
      return { dateStr, energy: getDailyEnergy(dateStr) };
    });

    return {
      monthIndex,
      days,
      total: days.reduce((sum, item) => sum + item.energy, 0),
    };
  });

  const moveScope = (offset: number) => {
    const next = new Date(currentDate);
    if (scope === "year") next.setFullYear(next.getFullYear() + offset);
    else next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
        <section className="glass-card-strong rounded-[32px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]">Panorama</p>
              <h1 className="mt-2 text-3xl font-black">
                {scope === "year" ? `${year} 年视图` : `${year} ${MONTH_NAMES[month]}`}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <FocusScopeSwitcher />
              <div className="glass-card flex items-center gap-1 rounded-full p-1">
                <button type="button" onClick={() => moveScope(-1)} className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => moveScope(1)} className="rounded-full p-2 text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTagIds([])}
              className={`rounded-full px-4 py-2 text-[12px] font-black ${
                selectedTagIds.length === 0 ? "bg-[var(--primary-color)] text-white" : "glass-card text-subtle"
              }`}
            >
              全部标签
            </button>
            {visibleTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-black ${
                  selectedTagIds.includes(tag.id) ? "text-white" : "glass-card text-subtle"
                }`}
                style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color } : undefined}
              >
                <span>{tag.emoji}</span>
                <span>{tag.name}</span>
                {selectedTagIds.includes(tag.id) && <Check size={12} />}
              </button>
            ))}
            {tags.length > VISIBLE_TAG_COUNT && (
              <button
                type="button"
                onClick={() => setShowMoreTags((value) => !value)}
                className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-black text-subtle"
              >
                <MoreHorizontal size={14} />
                更多
              </button>
            )}
          </div>
        </section>

        {scope === "month" ? (
          <section className="glass-card rounded-[32px] p-5">
            <div className="mb-4 grid grid-cols-7 gap-2">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name} className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-faint">
                  {name}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => {
                    const dateStr = day
                      ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      : "";
                    const energy = day ? getDailyEnergy(dateStr) : 0;
                    const opacity = Math.min(Math.abs(energy) / 6, 1);

                    return (
                      <button
                        key={dayIndex}
                        type="button"
                        onClick={() => day && router.push(`/day?date=${dateStr}`)}
                        className={`aspect-square rounded-[22px] border p-3 text-left ${
                          day ? "border-[var(--border-color)]" : "border-transparent opacity-0"
                        }`}
                        style={
                          day
                            ? {
                                backgroundColor:
                                  energy === 0
                                    ? "var(--panel-bg)"
                                    : energy > 0
                                      ? `rgba(var(--primary-rgb), ${0.18 + opacity * 0.72})`
                                      : "var(--score-punish)",
                                color: energy > 0 ? "white" : undefined,
                              }
                            : undefined
                        }
                      >
                        {day && (
                          <>
                            <p className="text-sm font-black">{day}</p>
                            <p className="mt-2 text-[11px] font-black">{energy.toFixed(settings.decimalPlaces)}</p>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] bg-[var(--primary-light)] px-4 py-3">
              <p className="text-[12px] font-black text-[var(--primary-color)]">当前热力累计</p>
              <p className="mt-1 text-2xl font-black">{monthEnergy.toFixed(settings.decimalPlaces)}</p>
            </div>
          </section>
        ) : (
          <section className="glass-card rounded-[32px] p-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {yearMonths.map((monthGroup) => (
                <button
                  key={monthGroup.monthIndex}
                  type="button"
                  onClick={() => router.push(`/day?date=${year}-${String(monthGroup.monthIndex + 1).padStart(2, "0")}-01`)}
                  className="rounded-[24px] border border-[var(--border-color)] p-3 text-left"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-black">{MONTH_NAMES[monthGroup.monthIndex]}</h3>
                    <span className="text-[11px] font-black text-[var(--primary-color)]">
                      {monthGroup.total.toFixed(settings.decimalPlaces)}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthGroup.days.map((item) => {
                      const opacity = Math.min(Math.abs(item.energy) / 6, 1);
                      return (
                        <span
                          key={item.dateStr}
                          className="aspect-square rounded-[8px]"
                          style={{
                            backgroundColor:
                              item.energy === 0
                                ? "var(--panel-bg)"
                                : item.energy > 0
                                  ? `rgba(var(--primary-rgb), ${0.18 + opacity * 0.72})`
                                  : "var(--score-punish)",
                          }}
                        />
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function MonthPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-faint">加载中...</div>}>
      <MonthContent />
    </Suspense>
  );
}
