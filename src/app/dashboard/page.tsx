"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Route,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import AppLogoMark from "@/components/layout/AppLogoMark";
import { getBlockTagIds } from "@/lib/blockTags";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";

type TrendTab = "heatmap" | "goals" | "flow";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().split("T")[0];
  });
}

function DashboardContent() {
  const { blocks, tags, settings, updateSettings } = useTimeStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: TrendTab =
    searchParams.get("tab") === "goals" || searchParams.get("tab") === "flow" ? (searchParams.get("tab") as TrendTab) : "heatmap";

  const completedBlocks = Object.values(blocks).filter((block) => block.status === "completed");
  const last7Days = getLast7Days();
  const weeklyTagGoals = useMemo(() => settings.weeklyTagGoals || {}, [settings.weeklyTagGoals]);

  const dailySeries = useMemo(
    () =>
      last7Days.map((dateStr) => ({
        dateStr,
        energy: completedBlocks
          .filter((block) => block.id.startsWith(dateStr))
          .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0),
      })),
    [completedBlocks, last7Days],
  );

  const tagStats = useMemo(
    () =>
      tags
        .map((tag) => {
          const relatedCompleted = completedBlocks.filter((block) => getBlockTagIds(block).includes(tag.id));
          const weekCount = relatedCompleted.filter((block) => last7Days.some((date) => block.id.startsWith(date))).length;
          const totalEnergy = relatedCompleted.reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
          return {
            tag,
            weekCount,
            totalEnergy,
            target: weeklyTagGoals[tag.id] || 0,
          };
        })
        .sort((left, right) => right.totalEnergy - left.totalEnergy),
    [completedBlocks, last7Days, tags, weeklyTagGoals],
  );

  const hourlyFlow = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => {
        const matches = completedBlocks.filter((block) => Number(block.hourId) === hour);
        const segments = tags
          .map((tag) => ({
            tag,
            count: matches.filter((block) => getBlockTagIds(block).includes(tag.id)).length,
          }))
          .filter((segment) => segment.count > 0);
        const total = segments.reduce((sum, segment) => sum + segment.count, 0);
        return { hour, segments, total };
      }),
    [completedBlocks, tags],
  );

  const strongestDay = dailySeries.reduce((best, current) => (current.energy > best.energy ? current : best), dailySeries[0]);
  const biggestGap = tagStats
    .filter((item) => item.target > 0)
    .sort((left, right) => right.target - right.weekCount - (left.target - left.weekCount))[0];

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <section className="glass-card-strong rounded-[34px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <AppLogoMark />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">Trends</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.06em]">趋势</h1>
                <p className="mt-2 text-sm font-medium text-faint">把热力、结构目标和时间流向收进同一个洞察系统。</p>
              </div>
            </div>

            <div className="rounded-full bg-[rgba(var(--primary-rgb),0.1)] px-4 py-2 text-[12px] font-black text-[var(--primary-color)]">
              最近 7 天
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <TabButton active={activeTab === "heatmap"} onClick={() => router.replace("/dashboard?tab=heatmap")} icon={<Flame size={14} />} label="热力" />
            <TabButton active={activeTab === "goals"} onClick={() => router.replace("/dashboard?tab=goals")} icon={<Target size={14} />} label="目标追踪" />
            <TabButton active={activeTab === "flow"} onClick={() => router.replace("/dashboard?tab=flow")} icon={<Route size={14} />} label="时间流向" />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <MetricTile icon={<TrendingUp size={16} />} label="最强日" value={strongestDay?.dateStr.slice(5) || "--"} />
          <MetricTile icon={<Sparkles size={16} />} label="结构缺口" value={biggestGap ? `${biggestGap.tag.emoji} ${Math.max(0, biggestGap.target - biggestGap.weekCount)}` : "暂无"} />
          <MetricTile icon={<Clock3 size={16} />} label="总完成块" value={String(completedBlocks.length)} />
        </div>

        {activeTab === "heatmap" ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="glass-card rounded-[32px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                  <CalendarDays size={14} />
                  热力总览
                </div>
                <Link href="/month?scope=month" className="text-[12px] font-black text-[var(--primary-color)]">
                  打开月视图
                </Link>
              </div>

              <div className="flex h-56 items-end gap-3 rounded-[28px] bg-[rgba(255,255,255,0.36)] p-4 dark:bg-white/[0.03]">
                {dailySeries.map((day) => {
                  const height = Math.max(16, Math.abs(day.energy) * 28);
                  return (
                    <div key={day.dateStr} className="flex flex-1 flex-col items-center gap-2">
                      <div className="text-[11px] font-black text-faint">{day.dateStr.slice(5)}</div>
                      <div className="flex w-full flex-1 items-end rounded-[24px] bg-black/[0.03] p-1 dark:bg-white/[0.04]">
                        <div
                          className="w-full rounded-[20px] bg-[linear-gradient(180deg,rgba(var(--primary-rgb),0.65),rgba(var(--primary-rgb),0.95))]"
                          style={{ height, opacity: day.energy === 0 ? 0.18 : 0.95 }}
                        />
                      </div>
                      <div className="text-[11px] font-black">{day.energy.toFixed(settings.decimalPlaces)}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-card rounded-[32px] p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                <Layers3 size={14} />
                标签能量
              </div>
              <div className="space-y-3">
                {tagStats.slice(0, 6).map((item) => (
                  <div key={item.tag.id}>
                    <div className="mb-1.5 flex items-center justify-between text-[13px] font-black">
                      <span className="inline-flex items-center gap-2">
                        <span>{item.tag.emoji}</span>
                        <span>{item.tag.name}</span>
                      </span>
                      <span style={{ color: item.tag.color }}>{item.totalEnergy.toFixed(settings.decimalPlaces)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, Math.min(100, item.totalEnergy * 12))}%`,
                          backgroundColor: item.tag.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "goals" ? (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="glass-card rounded-[32px] p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                <Target size={14} />
                结构目标矩阵
              </div>

              <div className="overflow-hidden rounded-[24px] border border-[var(--border-color)]">
                <div className="grid grid-cols-[minmax(120px,1.3fr)_repeat(7,minmax(0,1fr))] bg-black/[0.03] text-center text-[12px] font-black text-faint dark:bg-white/[0.03]">
                  <div className="px-3 py-3 text-left">标签</div>
                  {last7Days.map((day) => (
                    <div key={day} className="px-1 py-3">{day.slice(8)}</div>
                  ))}
                </div>

                {tagStats.map((item) => (
                  <div key={item.tag.id} className="grid grid-cols-[minmax(120px,1.3fr)_repeat(7,minmax(0,1fr))] items-center border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2 px-3 py-3 text-[13px] font-black">
                      <span>{item.tag.emoji}</span>
                      <span>{item.tag.name}</span>
                    </div>
                    {last7Days.map((day) => {
                      const hasBlock = completedBlocks.some((block) => getBlockTagIds(block).includes(item.tag.id) && block.id.startsWith(day));
                      return (
                        <div key={`${item.tag.id}-${day}`} className="flex justify-center px-1 py-2">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[12px] font-black"
                            style={{
                              backgroundColor: hasBlock ? item.tag.color : "var(--panel-soft)",
                              color: hasBlock ? "white" : "var(--text-muted)",
                            }}
                          >
                            {hasBlock ? item.tag.emoji : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="glass-card rounded-[32px] p-5">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                  <CheckCircle2 size={14} />
                  本周目标设置
                </div>

                <div className="space-y-3">
                  {tags.map((tag) => {
                    const value = weeklyTagGoals[tag.id] || 0;
                    const count = tagStats.find((item) => item.tag.id === tag.id)?.weekCount || 0;
                    return (
                      <div key={tag.id} className="rounded-[20px] border border-[var(--border-color)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 text-[13px] font-black">
                            <span>{tag.emoji}</span>
                            <span>{tag.name}</span>
                          </span>
                          <span className="text-[12px] font-black text-faint">{count}/{value}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          {Array.from({ length: 5 }, (_, index) => index).map((preset) => (
                            <button
                              key={`${tag.id}-${preset}`}
                              type="button"
                              onClick={() =>
                                updateSettings({
                                  weeklyTagGoals: {
                                    ...weeklyTagGoals,
                                    [tag.id]: preset,
                                  },
                                })
                              }
                              className={`rounded-full px-3 py-1.5 text-[12px] font-black ${
                                value === preset ? "bg-[var(--primary-color)] text-white" : "border border-[var(--border-color)]"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card rounded-[32px] p-5">
                <p className="text-sm font-black">当前建议</p>
                <p className="mt-2 text-[13px] font-medium text-faint">
                  {biggestGap
                    ? `这周优先补 ${biggestGap.tag.emoji} ${biggestGap.tag.name}。当前完成 ${biggestGap.weekCount}，目标 ${biggestGap.target}。`
                    : "先在这里给几个关键标签设置本周目标，趋势页就会开始表达结构缺口。"}
                </p>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === "flow" ? (
          <section className="glass-card rounded-[32px] p-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
              <Route size={14} />
              时间流向
            </div>

            <div className="space-y-2">
              {hourlyFlow.map((row) => (
                <div key={row.hour} className="grid grid-cols-[44px_1fr] items-center gap-3">
                  <div className="text-[12px] font-black text-faint">{String(row.hour).padStart(2, "0")}</div>
                  <div className="flex h-11 overflow-hidden rounded-[18px] border border-[var(--border-color)] bg-[var(--panel-soft)]">
                    {row.total > 0 ? (
                      row.segments.map((segment) => (
                        <div
                          key={`${row.hour}-${segment.tag.id}`}
                          className="flex h-full items-center justify-center text-[12px] font-black text-white"
                          style={{
                            width: `${(segment.count / row.total) * 100}%`,
                            backgroundColor: segment.tag.color,
                          }}
                        >
                          {segment.tag.emoji}
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[12px] font-medium text-faint">空白</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-faint">加载中...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-black ${
        active ? "bg-[var(--primary-color)] text-white" : "glass-card text-subtle"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
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
