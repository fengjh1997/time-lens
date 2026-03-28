"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, TrendingUp } from "lucide-react";
import AppLogoMark from "@/components/layout/AppLogoMark";
import { getBlockTagIds } from "@/lib/blockTags";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";
import { useSync } from "@/hooks/useSync";

function getWeekDates(today: Date) {
  const current = new Date(today);
  const weekday = current.getDay() || 7;
  current.setDate(current.getDate() - weekday + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(current);
    date.setDate(current.getDate() + index);
    return date.toISOString().split("T")[0];
  });
}

export default function TagsPage() {
  const { tags, blocks, addTag, removeTag, updateTag, settings } = useTimeStore();
  const { pushSettings } = useSync();
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("✨");
  const [newTagColor, setNewTagColor] = useState("#10b981");

  const weekDates = getWeekDates(new Date());

  const tagMetrics = useMemo(
    () =>
      tags.map((tag) => {
        const relatedBlocks = Object.values(blocks).filter((block) => getBlockTagIds(block).includes(tag.id));
        const completed = relatedBlocks.filter((block) => block.status === "completed");
        const weekBlocks = completed.filter((block) => weekDates.some((date) => block.id.startsWith(date)));
        const bestHour = completed.reduce<Record<number, number>>((map, block) => {
          const hour = Number(block.hourId);
          map[hour] = (map[hour] || 0) + 1;
          return map;
        }, {});

        const topHourEntry = Object.entries(bestHour).sort((left, right) => right[1] - left[1])[0];

        return {
          tag,
          usageCount: relatedBlocks.length,
          weekEnergy: weekBlocks.reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0),
          lastActiveAt: completed
            .map((block) => block.updatedAt || block.id.split("-").slice(0, 3).join("-"))
            .sort()
            .at(-1),
          topHour: topHourEntry ? Number(topHourEntry[0]) : null,
        };
      }),
    [blocks, tags, weekDates],
  );

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <section className="glass-card-strong rounded-[34px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/settings" className="glass-card inline-flex h-11 w-11 items-center justify-center rounded-full text-subtle">
                <ChevronLeft size={18} />
              </Link>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">Tag System</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.06em]">标签管理</h1>
                <p className="mt-2 text-sm font-medium text-faint">把标签从设置项升级成独立系统，查看使用频率、能量贡献和高频时段。</p>
              </div>
            </div>

            <AppLogoMark />
          </div>
        </section>

        <section className="glass-card rounded-[28px] p-4">
          <div className="grid grid-cols-[40px_1fr_56px_auto] items-center gap-2">
            <input
              value={newTagEmoji}
              onChange={(event) => setNewTagEmoji(event.target.value)}
              className="h-10 w-10 rounded-[14px] bg-white/80 text-center text-lg font-black outline-none dark:bg-white/[0.08]"
            />
            <input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="新标签"
              className="h-10 rounded-[14px] border border-[var(--border-color)] bg-transparent px-3 text-[14px] font-black outline-none"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(event) => setNewTagColor(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-[14px] border border-[var(--border-color)] bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                if (!newTagName.trim()) return;
                addTag({
                  id: `${Date.now()}`,
                  name: newTagName.trim(),
                  emoji: newTagEmoji || "✨",
                  color: newTagColor,
                  updatedAt: new Date().toISOString(),
                });
                setNewTagName("");
                setNewTagEmoji("✨");
                setNewTagColor("#10b981");
                window.setTimeout(() => pushSettings(), 50);
              }}
              className="inline-flex items-center gap-2 rounded-[14px] bg-[var(--primary-color)] px-4 py-2 text-[13px] font-black text-white"
            >
              <Plus size={14} />
              添加
            </button>
          </div>
        </section>

        <div className="grid gap-4">
          {tagMetrics.map((item) => (
            <section key={item.tag.id} className="glass-card rounded-[28px] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    value={item.tag.emoji}
                    onChange={(event) => updateTag({ ...item.tag, emoji: event.target.value || item.tag.emoji, updatedAt: new Date().toISOString() })}
                    onBlur={() => pushSettings()}
                    className="h-10 w-10 rounded-[14px] bg-white/80 text-center text-lg font-black outline-none dark:bg-white/[0.08]"
                  />
                  <div className="min-w-0">
                    <input
                      value={item.tag.name}
                      onChange={(event) => updateTag({ ...item.tag, name: event.target.value, updatedAt: new Date().toISOString() })}
                      onBlur={() => pushSettings()}
                      className="w-full bg-transparent text-xl font-black tracking-[-0.04em] outline-none"
                      style={{ color: item.tag.color }}
                    />
                    <p className="mt-1 text-[12px] font-medium text-faint">
                      最近活跃：{item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleDateString() : "暂无"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.tag.color}
                    onChange={(event) => updateTag({ ...item.tag, color: event.target.value, updatedAt: new Date().toISOString() })}
                    onBlur={() => pushSettings()}
                    className="h-9 w-10 cursor-pointer rounded-[12px] border border-[var(--border-color)] bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      removeTag(item.tag.id);
                      window.setTimeout(() => pushSettings(), 50);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricCard label="使用次数" value={String(item.usageCount)} />
                <MetricCard label="本周能量" value={item.weekEnergy.toFixed(settings.decimalPlaces)} />
                <MetricCard label="高频时段" value={item.topHour === null ? "--" : `${String(item.topHour).padStart(2, "0")}:00`} />
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                <TrendingUp size={14} />
                趋势预览
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/[0.04] dark:bg-white/[0.05]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(8, Math.min(100, item.usageCount * 8))}%`,
                    backgroundColor: item.tag.color,
                  }}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--border-color)] bg-black/[0.03] px-4 py-3 dark:bg-white/[0.04]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
