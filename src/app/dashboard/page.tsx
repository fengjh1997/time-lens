"use client";

import { useMemo } from "react";
import { ArrowUpRight, CircleGauge, Clock3, Layers3, Sparkles, Target, TrendingUp } from "lucide-react";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";

export default function DashboardPage() {
  const { blocks, tags, settings } = useTimeStore();
  const completedBlocks = Object.values(blocks).filter((block) => block.status === "completed");

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

  const tagMap = tags.map((tag) => ({
    ...tag,
    energy: completedBlocks
      .filter((block) => block.tagId === tag.id)
      .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0),
  })).sort((left, right) => right.energy - left.energy);

  const totalEnergy = completedBlocks.reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
  const bestHour = hourly.reduce((best, current) => (current.energy > best.energy ? current : best), hourly[0]);
  const strongestDay = last7Days.reduce((best, current) => (current.energy > best.energy ? current : best), last7Days[0]);

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-10">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-card-strong rounded-[34px] p-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
              <Sparkles size={14} />
              洞察
            </div>
            <ArrowUpRight size={16} className="text-faint" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricTile icon={<CircleGauge size={16} />} label="总能量" value={totalEnergy.toFixed(settings.decimalPlaces)} />
            <MetricTile icon={<Clock3 size={16} />} label="强势时段" value={`${String(bestHour.hour).padStart(2, "0")}:00`} />
            <MetricTile icon={<Target size={16} />} label="高光日" value={strongestDay?.date || "--"} />
          </div>

          <div className="mt-5 rounded-[28px] border border-[var(--border-color)] p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--primary-color)]" />
              <span className="text-sm font-black">近 7 天节奏</span>
            </div>
            <div className="flex h-48 items-end gap-3">
              {last7Days.map((day) => {
                const height = Math.max(16, Math.abs(day.energy) * 28);
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="text-[11px] font-black text-faint">{day.date}</div>
                    <div className="flex w-full flex-1 items-end rounded-[24px] bg-black/[0.03] p-1 dark:bg-white/[0.04]">
                      <div
                        className="w-full rounded-[20px] bg-[var(--primary-color)]"
                        style={{ height, opacity: day.energy === 0 ? 0.18 : 0.95 }}
                      />
                    </div>
                    <div className="text-[11px] font-black">{day.energy.toFixed(settings.decimalPlaces)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="glass-card rounded-[30px] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 size={16} className="text-[var(--primary-color)]" />
              <span className="text-sm font-black">标签能量</span>
            </div>
            <div className="space-y-3">
              {tagMap.slice(0, 6).map((tag) => (
                <div key={tag.id}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px] font-black">
                    <span className="inline-flex items-center gap-2">
                      <span>{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </span>
                    <span style={{ color: tag.color }}>{tag.energy.toFixed(settings.decimalPlaces)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(6, (Math.abs(tag.energy) / Math.max(Math.abs(totalEnergy), 1)) * 100)}%`,
                        backgroundColor: tag.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[30px] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 size={16} className="text-[var(--primary-color)]" />
              <span className="text-sm font-black">24 小时分布</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {hourly.map((item) => (
                <div
                  key={item.hour}
                  className="rounded-[16px] border border-[var(--border-color)] px-2 py-2 text-center"
                  style={{
                    backgroundColor:
                      item.energy === 0
                        ? "var(--panel-soft)"
                        : `rgba(var(--primary-rgb), ${0.15 + Math.min(Math.abs(item.energy) / 5, 1) * 0.7})`,
                  }}
                >
                  <div className="text-[10px] font-black text-faint">{String(item.hour).padStart(2, "0")}</div>
                  <div className="mt-1 text-[11px] font-black">{item.energy.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--border-color)] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.04]">
      <div className="inline-flex rounded-[14px] bg-[var(--primary-light)] p-2 text-[var(--primary-color)]">{icon}</div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
