"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Goal, Tags, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTimeStore } from "@/store/timeStore";

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

export default function CanvasUtilityPanels() {
  const { tags, settings, getDayEnergy, getWeekEnergy, updateSettings } = useTimeStore();
  const [panel, setPanel] = useState<"tags" | "goals" | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const today = new Date().toISOString().split("T")[0];
  const weekDates = useMemo(() => getWeekDates(new Date()), []);
  const todayEnergy = getDayEnergy(today);
  const weekEnergy = getWeekEnergy(weekDates);
  const todayRatio = Math.min(1, todayEnergy / Math.max(settings.dailyEnergyGoal, 0.1));
  const weekRatio = Math.min(1, weekEnergy / Math.max(settings.weeklyEnergyGoal, 0.1));
  const weeklyTagGoals = settings.weeklyTagGoals || {};
  const selectedTagIds = (searchParams.get("tags") || "").split(",").filter(Boolean);

  const goalSummary = tags
    .map((tag) => {
      const target = weeklyTagGoals[tag.id] || 0;
      const count = weekDates.reduce((sum, date) => {
        const store = useTimeStore.getState();
        const blocks = store.getBlocksForDate(date);
        return sum + blocks.filter((block) => block.tagId === tag.id && block.status === "completed").length;
      }, 0);
      return { tag, target, count };
    })
    .filter((item) => item.target > 0)
    .sort((left, right) => left.target - left.count - (right.target - right.count));

  const updateTagFilter = (nextTagIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTagIds.length > 0) {
      params.set("tags", nextTagIds.join(","));
    } else {
      params.delete("tags");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className="glass-card flex items-center gap-1 rounded-full p-1">
        <button
          type="button"
          onClick={() => setPanel("tags")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all ${
            panel === "tags" ? "bg-[var(--primary-color)] text-white" : "text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
          }`}
          aria-label="标签面板"
        >
          <Tags size={16} />
        </button>
        <button
          type="button"
          onClick={() => setPanel("goals")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all ${
            panel === "goals" ? "bg-[var(--primary-color)] text-white" : "text-subtle hover:bg-white/40 dark:hover:bg-white/[0.06]"
          }`}
          aria-label="目标面板"
        >
          <Goal size={16} />
        </button>
      </div>

      <AnimatePresence>
        {panel && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sheet-backdrop"
              onClick={() => setPanel(null)}
            />
            <motion.div
              initial={{ y: 56, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 56, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="bottom-sheet no-select"
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/10" />
              <div className="flex items-center justify-between px-5 py-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                  {panel === "tags" ? <Tags size={14} /> : <Goal size={14} />}
                  <span>{panel === "tags" ? "标签系统" : "目标系统"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="rounded-full bg-black/[0.04] p-2 text-subtle dark:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>

              {panel === "tags" ? (
                <div className="space-y-4 px-5 pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-faint">
                      这里选中的标签会在当前视图里做过滤显示，并用标签颜色接管时间块配色。
                    </p>
                    <button type="button" onClick={() => updateTagFilter([])} className="text-[12px] font-black text-[var(--primary-color)]">
                      清空
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {tags.map((tag) => {
                      const active = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            updateTagFilter(
                              active ? selectedTagIds.filter((item) => item !== tag.id) : [...selectedTagIds, tag.id],
                            )
                          }
                          className={`rounded-[20px] border px-4 py-4 text-left transition ${
                            active ? "border-transparent text-white shadow-lg" : "border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.03]"
                          }`}
                          style={active ? { backgroundColor: tag.color } : undefined}
                        >
                          <div className="text-2xl">{tag.emoji}</div>
                          <div className="mt-2 text-[13px] font-black">{tag.name}</div>
                        </button>
                      );
                    })}
                  </div>
                  <Link
                    href="/tags"
                    onClick={() => setPanel(null)}
                    className="inline-flex rounded-full bg-[var(--primary-color)] px-4 py-2 text-[13px] font-black text-white"
                  >
                    打开标签管理
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 px-5 pb-6">
                  <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.12),rgba(255,255,255,0.55))] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-black text-[var(--primary-color)]">目标联动</p>
                        <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">今天与本周的节律概览</h3>
                      </div>
                      <div className="liquid-ring flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--primary-rgb),0.2)] bg-[linear-gradient(180deg,rgba(var(--primary-rgb),0.92),rgba(var(--primary-rgb),0.62))] text-lg font-black text-white">
                        {Math.round(weekRatio * 100)}%
                      </div>
                    </div>
                  </div>

                  <LiquidGoalCard
                    title="今日总量"
                    helper="今天先把势能充起来"
                    value={todayEnergy}
                    goal={settings.dailyEnergyGoal}
                    ratio={todayRatio}
                    onChange={(goal) => updateSettings({ dailyEnergyGoal: goal })}
                  />
                  <LiquidGoalCard
                    title="本周总量"
                    helper="用一周的节律来平衡输出"
                    value={weekEnergy}
                    goal={settings.weeklyEnergyGoal}
                    ratio={weekRatio}
                    onChange={(goal) => updateSettings({ weeklyEnergyGoal: goal })}
                  />

                  <div className="glass-card rounded-[24px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">结构目标</p>
                        <p className="mt-1 text-[12px] font-medium text-faint">先追踪关键标签，再考虑更细的节律目标。</p>
                      </div>
                      <Link href="/dashboard?tab=goals" onClick={() => setPanel(null)} className="text-[12px] font-black text-[var(--primary-color)]">
                        打开追踪
                      </Link>
                    </div>
                    <div className="mt-4 space-y-2">
                      {goalSummary.length > 0 ? (
                        goalSummary.slice(0, 3).map(({ tag, count, target }) => (
                          <div key={tag.id} className="flex items-center justify-between rounded-[18px] border border-[var(--border-color)] px-3 py-2 text-[12px] font-black">
                            <span className="inline-flex items-center gap-2">
                              <span>{tag.emoji}</span>
                              <span>{tag.name}</span>
                            </span>
                            <span style={{ color: tag.color }}>{count}/{target}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] font-medium text-faint">还没有结构目标。去趋势页里为关键标签设置每周目标。</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function LiquidGoalCard({
  title,
  helper,
  value,
  goal,
  ratio,
  onChange,
}: {
  title: string;
  helper: string;
  value: number;
  goal: number;
  ratio: number;
  onChange: (goal: number) => void;
}) {
  return (
    <div className="glass-card overflow-hidden rounded-[26px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black">{title}</p>
          <p className="mt-1 text-[12px] font-medium text-faint">{helper}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/50 px-2 py-1 dark:bg-white/[0.06]">
          {[goal - 1, goal, goal + 1].map((preset, index) => {
            const valuePreset = Math.max(1, Number(preset.toFixed(1)));
            return (
              <button
                key={`${title}-${index}`}
                type="button"
                onClick={() => onChange(valuePreset)}
                className={`rounded-full px-2 py-1 text-[11px] font-black ${
                  Math.abs(goal - valuePreset) < 0.01 ? "bg-[var(--primary-color)] text-white" : "text-subtle"
                }`}
              >
                {valuePreset}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.1),rgba(255,255,255,0.4))] p-4">
        <div className="mb-3 flex items-end justify-between">
          <div className="text-3xl font-black tracking-[-0.06em]">{value.toFixed(1)}</div>
          <div className="text-[12px] font-black text-faint">/ {goal.toFixed(1)}</div>
        </div>

        <div className="overflow-hidden rounded-[999px] border border-[rgba(var(--primary-rgb),0.16)] bg-[rgba(var(--primary-rgb),0.08)] p-1">
          <div className="relative h-8 overflow-hidden rounded-[999px] bg-white/35 dark:bg-white/[0.06]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-[999px] bg-[linear-gradient(90deg,rgba(var(--primary-rgb),0.55),rgba(var(--primary-rgb),0.92))]"
              animate={{ width: `${Math.max(8, ratio * 100)}%` }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            />
            <motion.div
              className="absolute inset-y-1 left-2 rounded-full bg-white/45 blur-sm"
              animate={{ x: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "32%" }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-black">
              <span className="text-[var(--foreground)]">液态进度</span>
              <span className="text-[var(--foreground)]">{Math.round(ratio * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
