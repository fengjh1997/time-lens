"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { GripVertical, PlusCircle, Sparkles } from "lucide-react";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import RecordModal from "./RecordModal";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import { useSync } from "@/hooks/useSync";
import { useTimeStore } from "@/store/timeStore";
import type { Score, TimeBlock } from "@/types";

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getScoreColor(score: Score | undefined, status?: string) {
  if (status === "planned") return "transparent";
  if (score === undefined || score === 0) return "var(--score-empty)";
  if (score === -1) return "var(--score-punish)";
  return `rgba(var(--primary-rgb), ${Math.max(score, 0.2)})`;
}

interface WeekGridProps {
  weekDates: string[];
}

export default function WeekGrid({ weekDates }: WeekGridProps) {
  const { blocks, saveBlock, deleteBlock, getDayEnergy, getWeekEnergy, settings } = useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedCell, setSelectedCell] = useState<{ date: string; hour: number | string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleHours = settings.hideSleepTime
    ? ALL_HOURS.filter((hour) => !SLEEP_HOURS.includes(hour))
    : ALL_HOURS;

  const monthLabel = useMemo(() => {
    const head = new Date(`${weekDates[0]}T00:00:00`);
    return `${head.getFullYear()}.${String(head.getMonth() + 1).padStart(2, "0")}`;
  }, [weekDates]);

  const currentMonthDates = useMemo(() => {
    const head = new Date(`${weekDates[0]}T00:00:00`);
    const start = new Date(head.getFullYear(), head.getMonth(), 1);
    const end = new Date(head.getFullYear(), head.getMonth() + 1, 0);
    return Array.from({ length: end.getDate() }, (_, index) => {
      const date = new Date(start);
      date.setDate(index + 1);
      return date.toISOString().split("T")[0];
    });
  }, [weekDates]);

  const monthEnergy = currentMonthDates.reduce((sum, date) => sum + getDayEnergy(date), 0);

  const handleCellClick = (date: string, hour: number | string) => {
    setSelectedCell({ date, hour });
    setIsModalOpen(true);
  };

  const handleDragUpdate = (date: string, oldHour: number, newHour: number) => {
    if (oldHour === newHour) return;
    const oldKey = `${date}-${oldHour}`;
    const newKey = `${date}-${newHour}`;
    const block = blocks[oldKey];
    if (!block) return;

    const nextBlock: TimeBlock = {
      ...block,
      id: newKey,
      hourId: newHour,
      updatedAt: new Date().toISOString(),
    };

    deleteBlock(date, block.id);
    saveBlock(date, nextBlock);
    deleteCloudBlock(block.id);
    pushBlock(nextBlock, date);
  };

  const handleChargeSave = (date: string, hourId: number, score: Score) => {
    const key = `${date}-${hourId}`;
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

    saveBlock(date, nextBlock);
    pushBlock(nextBlock, date);
  };

  const activeBlockKey =
    selectedCell && typeof selectedCell.hour === "number"
      ? `${selectedCell.date}-${selectedCell.hour}`
      : selectedCell
        ? `${selectedCell.date}-${String(selectedCell.hour)}`
        : null;

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-10">
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(block) => {
          if (!selectedCell) return;
          saveBlock(selectedCell.date, block);
          pushBlock(block, selectedCell.date);
        }}
        onDelete={(id) => {
          if (!selectedCell) return;
          deleteBlock(selectedCell.date, id);
          deleteCloudBlock(id);
          setIsModalOpen(false);
        }}
        initialData={activeBlockKey ? blocks[activeBlockKey] : null}
        dateStr={selectedCell?.date}
        hourIdx={typeof selectedCell?.hour === "number" ? selectedCell.hour : 0}
        hourId={selectedCell?.hour}
      />

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">
                  Week Focus
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  本周 {getWeekEnergy(weekDates).toFixed(settings.decimalPlaces)}
                </h2>
                <p className="mt-2 text-sm text-gray-500">月度与年度信息收进页头，不再抢占单独导航。</p>
              </div>
              <div className="rounded-[24px] bg-[var(--primary-light)] p-4 text-[var(--primary-color)]">
                <Sparkles size={24} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatPill label="周目标" value={`${Math.min(100, Math.round((getWeekEnergy(weekDates) / settings.weeklyEnergyGoal) * 100))}%`} />
              <StatPill label={monthLabel} value={monthEnergy.toFixed(settings.decimalPlaces)} />
              <StatPill
                label="活跃天数"
                value={`${weekDates.filter((date) => getDayEnergy(date) !== 0).length}/7`}
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--primary-color)] font-black">
              Interaction
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>单击格子：打开编辑面板。</p>
              <p>长按格子：只充能，不再强制弹标签和感悟。</p>
              <p>拖动手柄：只移动，不与长按冲突。</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-[var(--border-color)] bg-white/70 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <div className="grid grid-cols-[68px_repeat(7,minmax(120px,1fr))] border-b border-[var(--border-color)]">
            <div className="border-r border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]" />
            {weekDates.map((date, index) => (
              <Link
                key={date}
                href={`/day?date=${date}`}
                className="border-r border-[var(--border-color)] px-3 py-4 last:border-r-0 hover:bg-[var(--primary-light)]/40"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{DAY_NAMES[index]}</p>
                <p className="mt-1 text-xl font-black">{date.slice(-2)}</p>
                <p className="mt-1 text-[12px] font-bold text-[var(--primary-color)]">
                  {getDayEnergy(date).toFixed(settings.decimalPlaces)}
                </p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[68px_repeat(7,minmax(120px,1fr))]">
            <div className="border-r border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
              {visibleHours.map((hour) => (
                <div
                  key={hour}
                  className="flex h-[72px] items-start justify-center border-b border-[var(--border-color)] pt-3 text-[12px] font-black text-gray-400 last:border-b-0"
                >
                  {String(hour).padStart(2, "0")}
                </div>
              ))}
              <div className="flex h-[72px] items-center justify-center border-t border-[var(--border-color)] text-[11px] font-black uppercase tracking-[0.22em] text-[var(--primary-color)]">
                bonus
              </div>
            </div>

            {weekDates.map((date) => (
              <div key={date} className="border-r border-[var(--border-color)] last:border-r-0">
                {visibleHours.map((hour) => (
                  <WeekGridCell
                    key={`${date}-${hour}`}
                    date={date}
                    hour={hour}
                    block={blocks[`${date}-${hour}`]}
                    allVisibleHours={visibleHours}
                    onCellClick={handleCellClick}
                    onCharge={handleChargeSave}
                    onDragMove={handleDragUpdate}
                  />
                ))}

                <div
                  onClick={() => handleCellClick(date, "bonus")}
                  className="flex h-[72px] cursor-pointer items-center justify-center border-t border-[var(--border-color)] bg-[var(--primary-light)]/30 transition-all hover:bg-[var(--primary-light)]/60"
                >
                  {blocks[`${date}-bonus`] ? (
                    <div className="flex flex-col items-center gap-1">
                      <MiniStarDisplay score={blocks[`${date}-bonus`].score} size={14} />
                      <span className="max-w-[100px] truncate text-[10px] font-bold text-gray-500">
                        {blocks[`${date}-bonus`].content || "补充说明"}
                      </span>
                    </div>
                  ) : (
                    <PlusCircle size={18} className="text-[var(--primary-color)]/50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function WeekGridCell({
  date,
  hour,
  block,
  allVisibleHours,
  onCellClick,
  onCharge,
  onDragMove,
}: {
  date: string;
  hour: number;
  block?: TimeBlock;
  allVisibleHours: number[];
  onCellClick: (date: string, hour: number | string) => void;
  onCharge: (date: string, hour: number, score: Score) => void;
  onDragMove: (date: string, fromHour: number, toHour: number) => void;
}) {
  const dragControls = useDragControls();
  const suppressClickRef = useRef(false);
  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging } = useLongPressCharge({
    onChargeComplete: (score) => {
      suppressClickRef.current = true;
      onCharge(date, hour, score);
    },
  });

  return (
    <motion.div
      layout
      drag={!!block}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        if (!block) return;
        const sourceIndex = allVisibleHours.indexOf(hour);
        const nextIndex = Math.max(
          0,
          Math.min(allVisibleHours.length - 1, sourceIndex + Math.round(info.offset.y / 72)),
        );
        if (nextIndex !== sourceIndex) {
          onDragMove(date, hour, allVisibleHours[nextIndex]);
        }
        suppressClickRef.current = true;
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
        const finalScore = stopCharging();
        if (finalScore > 0) {
          suppressClickRef.current = true;
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 120);
        }
      }}
      onPointerLeave={() => stopCharging()}
      onClick={() => {
        if (suppressClickRef.current) return;
        onCellClick(date, hour);
      }}
      className={`relative flex h-[72px] cursor-pointer items-center border-b border-[var(--border-color)] px-2 py-1 last:border-b-0 ${
        SLEEP_HOURS.includes(hour) ? "bg-black/[0.02] dark:bg-white/[0.02]" : "bg-transparent"
      }`}
      style={block ? { backgroundColor: getScoreColor(block.score, block.status) } : undefined}
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

      {block ? (
        <div className="relative z-10 flex w-full items-center justify-between gap-2">
          <div className="min-w-0">
            {block.tagId && <p className="text-[11px] font-black text-[var(--foreground)]">已标记</p>}
            <p className="truncate text-[10px] font-medium text-[var(--foreground)]/75">
              {block.content || (block.status === "planned" ? "待补充计划" : "点击补充说明")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {block.status === "completed" && block.score !== 0 && <MiniStarDisplay score={block.score} size={12} />}
            <button
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation();
                stopCharging();
                suppressClickRef.current = true;
                dragControls.start(event);
              }}
              className="rounded-full border border-[var(--border-color)] bg-white/80 p-1 text-gray-400 dark:bg-black/20"
              aria-label="拖动时间块"
            >
              <GripVertical size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full text-center text-[10px] font-bold text-gray-300">空</div>
      )}
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--border-color)] bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
