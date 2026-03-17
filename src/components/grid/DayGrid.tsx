"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { CalendarRange, GripVertical, Plus, Sparkles, Target } from "lucide-react";
import { MiniStarDisplay, EnergyDisplay } from "@/components/ui/StarRating";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import RecordModal from "./RecordModal";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import { useSync } from "@/hooks/useSync";
import { SCORE_ENERGY, useTimeStore } from "@/store/timeStore";
import type { Score, Tag, TimeBlock } from "@/types";

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];

function getScoreColor(score?: Score) {
  if (score === undefined || score === 0) return "var(--score-empty)";
  if (score === -1) return "var(--score-punish)";
  if (score === 0.25) return "var(--score-1)";
  if (score === 0.5) return "var(--score-2)";
  if (score === 0.75) return "var(--score-3)";
  return "var(--score-4)";
}

function formatMonth(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00`);
  const month = target.getMonth();
  const year = target.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    label: `${year}.${String(month + 1).padStart(2, "0")}`,
    days: Array.from({ length: end.getDate() }, (_, index) => {
      const date = new Date(start);
      date.setDate(index + 1);
      return date.toISOString().split("T")[0];
    }),
  };
}

function getYearRange(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00`);
  return Array.from({ length: 12 }, (_, month) => {
    const start = new Date(target.getFullYear(), month, 1);
    const end = new Date(target.getFullYear(), month + 1, 0);
    return Array.from({ length: end.getDate() }, (_, index) => {
      const date = new Date(start);
      date.setDate(index + 1);
      return date.toISOString().split("T")[0];
    });
  });
}

interface DayGridProps {
  dateStr?: string;
}

export default function DayGrid({ dateStr = new Date().toISOString().split("T")[0] }: DayGridProps) {
  const { blocks, saveBlock, deleteBlock, getBlocksForDate, getDayEnergy, getWeekEnergy, tags, settings } =
    useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedHour, setSelectedHour] = useState<number | string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleHours = settings.hideSleepTime
    ? ALL_HOURS.filter((hour) => !SLEEP_HOURS.includes(hour))
    : ALL_HOURS;

  const dayBlocks = getBlocksForDate(dateStr);
  const dayEnergy = getDayEnergy(dateStr);

  const { label: monthLabel, days: monthDates } = useMemo(() => formatMonth(dateStr), [dateStr]);
  const monthEnergy = monthDates.reduce((sum, date) => sum + getDayEnergy(date), 0);
  const monthActiveDays = monthDates.filter((date) => getBlocksForDate(date).length > 0).length;

  const yearMonths = useMemo(() => getYearRange(dateStr), [dateStr]);
  const yearEnergy = yearMonths.reduce(
    (sum, monthDatesList) => sum + monthDatesList.reduce((inner, date) => inner + getDayEnergy(date), 0),
    0,
  );

  const weekDates = useMemo(() => {
    const target = new Date(`${dateStr}T00:00:00`);
    const day = target.getDay() || 7;
    const monday = new Date(target);
    monday.setDate(target.getDate() - day + 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toISOString().split("T")[0];
    });
  }, [dateStr]);

  const completedCount = dayBlocks.filter((block) => block.status === "completed" && !block.isBonus).length;
  const plannedCount = dayBlocks.filter((block) => block.status === "planned").length;

  const bestBlock = [...dayBlocks]
    .filter((block) => block.status === "completed" && block.score > 0)
    .sort((a, b) => SCORE_ENERGY[b.score] - SCORE_ENERGY[a.score])[0];

  const getTagForBlock = (block?: TimeBlock | null) => tags.find((tag) => tag.id === block?.tagId);

  const handleDragUpdate = (fromHour: number | string, toHour: number | string) => {
    if (fromHour === toHour) return;
    const fromKey = typeof fromHour === "number" ? `${dateStr}-${fromHour}` : `${dateStr}-${String(fromHour)}`;
    const toKey = typeof toHour === "number" ? `${dateStr}-${toHour}` : `${dateStr}-${String(toHour)}`;
    const block = blocks[fromKey];
    if (!block) return;

    const nextBlock: TimeBlock = {
      ...block,
      id: toKey,
      hourId: toHour,
      updatedAt: new Date().toISOString(),
    };

    deleteBlock(dateStr, block.id);
    saveBlock(dateStr, nextBlock);
    deleteCloudBlock(block.id);
    pushBlock(nextBlock, dateStr);
  };

  const handleChargeSave = (hourId: number | string, score: Score) => {
    const key = typeof hourId === "number" ? `${dateStr}-${hourId}` : `${dateStr}-${String(hourId)}`;
    const existing = blocks[key];
    const nextBlock: TimeBlock = existing
      ? {
          ...existing,
          score,
          status: "completed",
          updatedAt: new Date().toISOString(),
        }
      : {
          id: key,
          hourId,
          content: "",
          score,
          status: "completed",
          updatedAt: new Date().toISOString(),
        };

    saveBlock(dateStr, nextBlock);
    pushBlock(nextBlock, dateStr);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    saveBlock(dateStr, block);
    pushBlock(block, dateStr);
  };

  const handleDeleteBlock = (id: string) => {
    deleteBlock(dateStr, id);
    deleteCloudBlock(id);
    setIsModalOpen(false);
  };

  const activeBlockKey =
    selectedHour !== null
      ? typeof selectedHour === "number"
        ? `${dateStr}-${selectedHour}`
        : `${dateStr}-${String(selectedHour)}`
      : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dateStr={dateStr}
        hourIdx={typeof selectedHour === "number" ? selectedHour : 0}
        hourId={selectedHour ?? undefined}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">
                  Day Focus
                </p>
                <div className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)]">
                  <EnergyDisplay value={dayEnergy} decimals={settings.decimalPlaces} />
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  已完成 {completedCount} 个时间块，待补充 {plannedCount} 个。
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--primary-light)] p-4 text-[var(--primary-color)]">
                <Sparkles size={26} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard label="本周累计" value={getWeekEnergy(weekDates).toFixed(settings.decimalPlaces)} />
              <MetricCard label={monthLabel} value={monthEnergy.toFixed(settings.decimalPlaces)} />
              <MetricCard label="年度累计" value={yearEnergy.toFixed(settings.decimalPlaces)} />
            </div>

            {bestBlock && (
              <div className="mt-5 flex items-center justify-between rounded-[24px] bg-[var(--primary-light)]/70 px-4 py-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--primary-color)]">
                    Best Block
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                    {String(bestBlock.hourId).padStart(2, "0")}:00 · {getTagForBlock(bestBlock)?.name || "未分类"}
                  </p>
                </div>
                <MiniStarDisplay score={bestBlock.score} size={18} />
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--primary-color)] font-black">
                  全景嵌入
                </p>
                <h3 className="mt-2 text-lg font-black">月度和年度不再单独抢主舞台</h3>
              </div>
              <CalendarRange size={22} className="text-[var(--primary-color)]" />
            </div>
            <div className="mt-5 space-y-4">
              <MiniTimeline label="月活跃天数" value={`${monthActiveDays}/${monthDates.length}`} ratio={monthActiveDays / monthDates.length} />
              <MiniTimeline label="今日目标进度" value={`${Math.min(100, Math.round((dayEnergy / settings.dailyEnergyGoal) * 100))}%`} ratio={Math.min(1, dayEnergy / settings.dailyEnergyGoal)} />
              <MiniTimeline label="本周目标进度" value={`${Math.min(100, Math.round((getWeekEnergy(weekDates) / settings.weeklyEnergyGoal) * 100))}%`} ratio={Math.min(1, getWeekEnergy(weekDates) / settings.weeklyEnergyGoal)} />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/70 px-4 py-4 shadow-[var(--shadow-sm)] dark:bg-white/5 sm:px-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 font-black">Timeline</p>
              <h2 className="mt-1 text-lg font-black">单击编辑，长按充能，拖动手柄移动</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-[11px] font-black text-[var(--primary-color)]">
              <Target size={14} />
              <span>手势已解耦</span>
            </div>
          </div>

          <div className="space-y-3">
            {visibleHours.map((hour) => (
              <GridCell
                key={hour}
                hourIdx={hour}
                block={blocks[`${dateStr}-${hour}`]}
                isSleep={SLEEP_HOURS.includes(hour)}
                isCurrentHour={
                  dateStr === new Date().toISOString().split("T")[0] && hour === new Date().getHours()
                }
                onClick={(nextHour) => {
                  setSelectedHour(nextHour);
                  setIsModalOpen(true);
                }}
                onCharge={handleChargeSave}
                onDragMove={handleDragUpdate}
                tag={getTagForBlock(blocks[`${dateStr}-${hour}`])}
                allVisibleHours={visibleHours}
              />
            ))}
          </div>

          <div className="mt-8 border-t border-dashed border-[var(--border-color)] pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--primary-color)] font-black">
                  Bonus
                </p>
                <h3 className="mt-1 text-base font-black">额外时段</h3>
              </div>
              {!blocks[`${dateStr}-bonus`] && (
                <button
                  onClick={() => {
                    setSelectedHour("bonus");
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-light)] px-4 py-2 text-[12px] font-black text-[var(--primary-color)]"
                >
                  <Plus size={14} />
                  添加记录
                </button>
              )}
            </div>

            {blocks[`${dateStr}-bonus`] ? (
              <div
                onClick={() => {
                  setSelectedHour("bonus");
                  setIsModalOpen(true);
                }}
                className="cursor-pointer rounded-[28px] border border-[var(--border-color)] bg-[var(--primary-light)]/60 p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-[var(--primary-color)]">
                      {getTagForBlock(blocks[`${dateStr}-bonus`])?.name || "未分类"}
                    </p>
                    <p className="mt-1 truncate text-[12px] font-medium text-gray-600 dark:text-gray-300">
                      {blocks[`${dateStr}-bonus`].content || "点击补充说明"}
                    </p>
                  </div>
                  <MiniStarDisplay score={blocks[`${dateStr}-bonus`].score} size={18} />
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--border-color)] px-4 py-5 text-center text-[12px] font-bold text-gray-400">
                今天还没有额外时段记录
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function GridCell({
  hourIdx,
  block,
  isSleep,
  isCurrentHour,
  onClick,
  onCharge,
  onDragMove,
  tag,
  allVisibleHours,
}: {
  hourIdx: number;
  block?: TimeBlock;
  isSleep: boolean;
  isCurrentHour: boolean;
  onClick: (hour: number) => void;
  onCharge: (hour: number, score: Score) => void;
  onDragMove: (fromHour: number, toHour: number) => void;
  tag?: Tag;
  allVisibleHours: number[];
}) {
  const dragControls = useDragControls();
  const suppressClickRef = useRef(false);

  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging } = useLongPressCharge({
    onChargeComplete: (score) => {
      suppressClickRef.current = true;
      onCharge(hourIdx, score);
    },
    onCancel: () => {
      suppressClickRef.current = false;
    },
  });

  const hasContent = !!block && (block.status === "planned" || block.score !== 0 || !!block.content || !!block.tagId);
  const isCompleted = block?.status === "completed";
  const isPlanned = block?.status === "planned";

  return (
    <div className={`group flex items-stretch gap-4 ${isSleep ? "opacity-45" : ""}`}>
      <div
        className={`w-14 shrink-0 pt-4 text-right font-mono text-[13px] font-black ${
          isCurrentHour ? "text-[var(--primary-color)]" : "text-gray-300 dark:text-gray-700"
        }`}
      >
        {String(hourIdx).padStart(2, "0")}:00
      </div>

      <motion.div
        layout
        drag={!!block}
        dragListener={false}
        dragControls={dragControls}
        dragElastic={0.08}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (!block) return;
          suppressClickRef.current = true;
          const rowHeight = 84;
          const targetOffset = Math.round(info.offset.y / rowHeight);
          const sourceIndex = allVisibleHours.indexOf(hourIdx);
          const targetIndex = Math.max(0, Math.min(allVisibleHours.length - 1, sourceIndex + targetOffset));
          if (targetIndex !== sourceIndex) {
            onDragMove(hourIdx, allVisibleHours[targetIndex]);
          }
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 120);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          suppressClickRef.current = false;
          startCharging();
        }}
        onPointerUp={() => {
          const committed = stopCharging();
          if (committed > 0) {
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 120);
          }
        }}
        onPointerLeave={() => {
          stopCharging();
        }}
        onClick={() => {
          if (suppressClickRef.current) return;
          onClick(hourIdx);
        }}
        className={`relative min-h-[78px] flex-1 overflow-hidden rounded-[26px] border p-4 transition-all ${
          isPlanned
            ? "border-dashed border-[var(--primary-color)]/45 bg-[var(--primary-light)]/70"
            : "border-[var(--border-color)] bg-white/75 dark:bg-white/5"
        } ${isCurrentHour ? "ring-2 ring-[var(--primary-color)]/60" : ""}`}
        style={isCompleted && block?.score ? { backgroundColor: getScoreColor(block.score) } : undefined}
      >
        <AnimatePresence>
          {isCharging && (
            <ChargingOverlay
              progress={chargeProgress}
              score={currentChargeScore}
              isComplete={currentChargeScore === 1}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {tag && <p className="text-[12px] font-black text-[var(--foreground)]">{tag.name}</p>}
            {hasContent ? (
              <p className="mt-1 truncate text-[11px] font-medium text-[var(--foreground)]/78">
                {block?.content || "点击补充说明"}
              </p>
            ) : (
              <p className="text-[12px] font-bold text-gray-400">空白时段</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {block && isCompleted && block.score !== 0 && (
              <div className="rounded-full bg-black/10 px-3 py-1.5 dark:bg-white/10">
                <MiniStarDisplay score={block.score} size={16} />
              </div>
            )}

            {block && (
              <button
                type="button"
                onPointerDown={(event) => {
                  event.stopPropagation();
                  suppressClickRef.current = true;
                  stopCharging();
                  dragControls.start(event);
                }}
                className="rounded-full border border-[var(--border-color)] bg-white/80 p-2 text-gray-400 transition-all hover:text-[var(--primary-color)] dark:bg-black/20"
                aria-label="拖动时间块"
              >
                <GripVertical size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--border-color)] bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-2 text-lg font-black tabular-nums">{value}</p>
    </div>
  );
}

function MiniTimeline({
  label,
  value,
  ratio,
}: {
  label: string;
  value: string;
  ratio: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px] font-bold">
        <span className="text-gray-500">{label}</span>
        <span className="text-[var(--foreground)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--primary-color)] transition-all"
          style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
        />
      </div>
    </div>
  );
}
