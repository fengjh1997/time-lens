"use client";

import { useMemo, useState } from "react";
import { Clock3, Flame, Target, TrendingUp, Zap } from "lucide-react";
import { EnergyDisplay } from "@/components/ui/StarRating";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";

export default function DashboardPage() {
  const { blocks, totalEnergy, tags, settings } = useTimeStore();
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(tags[0]?.id);

  const completedBlocks = Object.values(blocks).filter((block) => block.status === "completed");
  const totalBlocks = completedBlocks.length;

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split("T")[0];
      const energy = completedBlocks
        .filter((block) => block.id.startsWith(dateStr))
        .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
      return { date: dateStr.slice(5), energy };
    });
  }, [completedBlocks]);

  const hourly = Array.from({ length: 24 }, (_, hour) => {
    const energy = completedBlocks
      .filter((block) => Number(block.hourId) === hour)
      .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
    return { hour, energy };
  });

  const bestHour = hourly.reduce((best, current) => (current.energy > best.energy ? current : best), hourly[0]);
  const currentStreak = last7Days.reduceRight((streak, day, index, arr) => {
    if (day.energy > 0) return streak + 1;
    return index === arr.length - 1 ? streak : streak;
  }, 0);

  const tagCounts = tags.map((tag) => ({
    ...tag,
    count: completedBlocks.filter((block) => block.tagId === tag.id).length,
  }));

  const selectedTag = tags.find((tag) => tag.id === selectedTagId);

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6">
        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">Insights</p>
          <h1 className="mt-2 text-3xl font-black">数据概览</h1>
          <p className="mt-2 text-sm text-gray-500">用更轻量的方式看趋势，不抢占主操作流。</p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard icon={<Zap size={18} />} label="总能量" value={<EnergyDisplay value={totalEnergy} decimals={settings.decimalPlaces} />} />
          <SummaryCard icon={<Flame size={18} />} label="已完成块" value={String(totalBlocks)} />
          <SummaryCard icon={<TrendingUp size={18} />} label="连续正能量" value={`${currentStreak} 天`} />
          <SummaryCard icon={<Clock3 size={18} />} label="黄金时段" value={`${bestHour.hour}:00`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--primary-color)]" />
              <h2 className="text-lg font-black">近 7 天能量</h2>
            </div>

            <div className="mt-6 flex h-56 items-end gap-3">
              {last7Days.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-[12px] font-black text-[var(--primary-color)]">{day.energy.toFixed(settings.decimalPlaces)}</div>
                  <div className="flex w-full items-end justify-center rounded-[22px] bg-black/[0.03] dark:bg-white/[0.04]">
                    <div
                      className="w-full rounded-[22px] bg-[var(--primary-color)]"
                      style={{ height: `${Math.max(12, Math.abs(day.energy) * 28)}px`, opacity: day.energy === 0 ? 0.2 : 1 }}
                    />
                  </div>
                  <div className="text-[11px] font-black text-gray-400">{day.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[var(--primary-color)]" />
              <h2 className="text-lg font-black">标签分布</h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`rounded-full px-4 py-2 text-[12px] font-black transition-all ${
                    selectedTagId === tag.id ? "text-white" : "bg-black/[0.03] text-gray-500 dark:bg-white/[0.04]"
                  }`}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : undefined}
                >
                  {tag.emoji} {tag.name}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {tagCounts
                .filter((tag) => tag.count > 0)
                .sort((left, right) => right.count - left.count)
                .map((tag) => (
                  <div key={tag.id}>
                    <div className="mb-2 flex items-center justify-between text-sm font-black">
                      <span>{tag.name}</span>
                      <span className="text-gray-400">{tag.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, (tag.count / Math.max(totalBlocks, 1)) * 100)}%`,
                          backgroundColor: tag.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {selectedTag && (
              <p className="mt-5 text-[12px] font-medium text-gray-500">
                当前聚焦标签：<span className="font-black" style={{ color: selectedTag.color }}>{selectedTag.name}</span>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
      <div className="mb-4 inline-flex rounded-[16px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400 font-black">{label}</p>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}
