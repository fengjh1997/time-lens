"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion";
import { PlusCircle } from "lucide-react";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import TagColorStack from "@/components/ui/TagColorStack";
import RecordModal from "./RecordModal";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import { useSync } from "@/hooks/useSync";
import { blockMatchesTagFilter, getBlockTags } from "@/lib/blockTags";
import { useTimeStore } from "@/store/timeStore";
import type { Score, TimeBlock } from "@/types";

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const DAY_NAMES = ["一", "二", "三", "四", "五", "六", "日"];

function getScoreColor(score: Score | undefined, status?: string) {
  if (status === "planned") return "rgba(var(--primary-rgb), 0.08)";
  if (score === undefined || score === 0) return "transparent";
  if (score === -1) return "var(--score-punish)";
  if (score === 0.25) return "var(--score-1)";
  if (score === 0.5) return "var(--score-2)";
  if (score === 0.75) return "var(--score-3)";
  return "var(--score-4)";
}

interface WeekGridProps {
  weekDates: string[];
  selectedTagIds?: string[];
}

export default function WeekGrid({ weekDates, selectedTagIds = [] }: WeekGridProps) {
  const { blocks, saveBlock, deleteBlock, getDayEnergy, settings, tags } = useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedCell, setSelectedCell] = useState<{ date: string; hour: number | string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleHours = settings.hideSleepTime
    ? ALL_HOURS.filter((hour) => !SLEEP_HOURS.includes(hour))
    : ALL_HOURS;

  const activeBlockKey = selectedCell === null ? null : `${selectedCell.date}-${String(selectedCell.hour)}`;
  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();

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

      <div className="mx-auto w-full max-w-7xl px-2 py-3 sm:px-4 sm:py-4">
        <section className="overflow-hidden rounded-[30px] border border-[rgba(15,23,42,0.05)] bg-[var(--panel-elevated)] shadow-[0_20px_40px_rgba(15,23,42,0.06)] no-select dark:border-white/[0.06]">
          <div className="grid grid-cols-[32px_repeat(7,minmax(0,1fr))] border-b border-[rgba(15,23,42,0.05)] sm:grid-cols-[46px_repeat(7,minmax(0,1fr))] dark:border-white/[0.05]">
            <div />
            {weekDates.map((date, index) => (
              <Link
                key={date}
                href={`/day?date=${date}`}
                className="border-r border-[rgba(15,23,42,0.05)] px-1 py-3 text-center last:border-r-0 dark:border-white/[0.05]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-faint">{DAY_NAMES[index]}</p>
                <p className="mt-1 text-sm font-black sm:text-base">{date.slice(-2)}</p>
                <div className="mt-1 flex justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--primary-rgb),0.7)]"
                    style={{ opacity: Math.min(getDayEnergy(date) / 4, 1) || 0.14 }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[32px_repeat(7,minmax(0,1fr))] sm:grid-cols-[46px_repeat(7,minmax(0,1fr))]">
            <div className="border-r border-[rgba(15,23,42,0.05)] dark:border-white/[0.05]">
              {visibleHours.map((hour) => (
                <div
                  key={hour}
                  className="flex h-[54px] items-start justify-center border-b border-[rgba(15,23,42,0.04)] pt-2 text-[10px] font-black text-faint sm:h-[68px] sm:pt-3 sm:text-[11px] dark:border-white/[0.04]"
                >
                  {String(hour).padStart(2, "0")}
                </div>
              ))}
              <div className="flex h-[54px] items-center justify-center border-t border-[rgba(15,23,42,0.05)] text-[10px] font-black uppercase tracking-[0.16em] text-[var(--primary-color)] sm:h-[68px] sm:text-[11px] dark:border-white/[0.05]">
                bonus
              </div>
            </div>

            {weekDates.map((date) => (
              <div key={date} className="border-r border-[rgba(15,23,42,0.05)] last:border-r-0 dark:border-white/[0.05]">
                {visibleHours.map((hour) => {
                  const visibleBlock = blockMatchesTagFilter(blocks[`${date}-${hour}`], selectedTagIds)
                    ? blocks[`${date}-${hour}`]
                    : undefined;
                  const visibleTags = getBlockTags(visibleBlock, tags);

                  return (
                    <WeekGridCell
                      key={`${date}-${hour}`}
                      hour={hour}
                      block={visibleBlock}
                      tags={visibleTags}
                      isCurrentSlot={date === today && hour === currentHour}
                      allVisibleHours={visibleHours}
                      useTagColors={selectedTagIds.length > 0}
                      onOpen={() => {
                        setSelectedCell({ date, hour });
                        setIsModalOpen(true);
                      }}
                      onCharge={(score) => {
                        const key = `${date}-${hour}`;
                        const existing = blocks[key];
                        const nextBlock: TimeBlock = existing
                          ? { ...existing, score, status: "completed", updatedAt: new Date().toISOString() }
                          : { id: key, hourId: hour, content: "", score, status: "completed", updatedAt: new Date().toISOString() };
                        saveBlock(date, nextBlock);
                        pushBlock(nextBlock, date);
                      }}
                      onDragMove={(toHour) => {
                        const fromKey = `${date}-${hour}`;
                        const existing = blocks[fromKey];
                        if (!existing || hour === toHour) return;
                        const nextBlock: TimeBlock = {
                          ...existing,
                          id: `${date}-${toHour}`,
                          hourId: toHour,
                          updatedAt: new Date().toISOString(),
                        };
                        deleteBlock(date, existing.id);
                        saveBlock(date, nextBlock);
                        deleteCloudBlock(existing.id);
                        pushBlock(nextBlock, date);
                      }}
                    />
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCell({ date, hour: "bonus" });
                    setIsModalOpen(true);
                  }}
                  className="flex h-[54px] w-full items-center justify-center border-t border-[rgba(15,23,42,0.05)] bg-[rgba(var(--primary-rgb),0.08)] sm:h-[68px] dark:border-white/[0.05]"
                >
                  {blocks[`${date}-bonus`] ? (
                    <MiniStarDisplay score={blocks[`${date}-bonus`].score} size={14} />
                  ) : (
                    <PlusCircle size={16} className="text-[var(--primary-color)]/66" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function WeekGridCell({
  hour,
  block,
  tags,
  isCurrentSlot,
  allVisibleHours,
  useTagColors,
  onOpen,
  onCharge,
  onDragMove,
}: {
  hour: number;
  block?: TimeBlock;
  tags: { id: string; emoji: string; color: string; name: string }[];
  isCurrentSlot: boolean;
  allVisibleHours: number[];
  useTagColors: boolean;
  onOpen: () => void;
  onCharge: (score: Score) => void;
  onDragMove: (toHour: number) => void;
}) {
  const dragControls = useDragControls();
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartedRef = useRef(false);
  const rowHeightRef = useRef(56);
  const dragSnapIndexRef = useRef<number | null>(null);
  const y = useMotionValue(0);
  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging, cancelCharging } =
    useLongPressCharge({ onChargeComplete: (score) => onCharge(score) });

  const isPlanned = block?.status === "planned";
  const isEmptyBlock = !block || (!block.content?.trim() && tags.length === 0 && block.score === 0 && block.status !== "planned");
  const currentIndex = allVisibleHours.indexOf(hour);

  return (
    <div className="flex h-[54px] items-center border-b border-[rgba(15,23,42,0.04)] p-1 sm:h-[68px] sm:p-1.5 dark:border-white/[0.04]">
      <motion.button
        type="button"
        layout
        drag={!!block}
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          rowHeightRef.current = event.currentTarget.parentElement?.getBoundingClientRect().height || 56;
          dragSnapIndexRef.current = currentIndex;
          pointerStartRef.current = { x: event.clientX, y: event.clientY };
          dragStartedRef.current = false;
          startCharging(block?.status === "completed" ? block.score : 0);
        }}
        onPointerMove={(event) => {
          if (!pointerStartRef.current || !block) return;
          const dx = event.clientX - pointerStartRef.current.x;
          const dy = event.clientY - pointerStartRef.current.y;
          if (Math.hypot(dx, dy) > 8 && !dragStartedRef.current) {
            dragStartedRef.current = true;
            cancelCharging();
            dragControls.start(event);
          }
        }}
        onDrag={(_, info) => {
          const nextIndex = Math.max(
            0,
            Math.min(allVisibleHours.length - 1, currentIndex + Math.round(info.offset.y / rowHeightRef.current)),
          );
          dragSnapIndexRef.current = nextIndex;
          y.set((nextIndex - currentIndex) * rowHeightRef.current);
        }}
        onPointerUp={() => {
          pointerStartRef.current = null;
          if (dragStartedRef.current) return;
          const finalScore = stopCharging();
          if (finalScore <= 0) onOpen();
        }}
        onPointerLeave={() => {
          if (dragStartedRef.current) return;
          pointerStartRef.current = null;
          cancelCharging();
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null;
          cancelCharging();
        }}
        onDragEnd={() => {
          if (!block) return;
          const nextIndex = dragSnapIndexRef.current ?? currentIndex;
          y.set(0);
          dragSnapIndexRef.current = null;
          if (nextIndex !== currentIndex) onDragMove(allVisibleHours[nextIndex]);
          dragStartedRef.current = false;
          pointerStartRef.current = null;
        }}
        className={`relative flex h-full w-full min-w-0 items-center overflow-hidden rounded-[18px] px-2 py-1.5 text-left no-select select-none [touch-action:none] sm:rounded-[20px] sm:px-2.5 ${
          isEmptyBlock
            ? "bg-[#f3f3f1] shadow-none dark:bg-[#1b2027]"
            : "border border-[rgba(var(--primary-rgb),0.14)] shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
        } ${isPlanned ? "border border-dashed border-[var(--primary-color)]" : ""} ${isCurrentSlot ? "ring-2 ring-[rgba(var(--primary-rgb),0.34)] ring-offset-1 ring-offset-transparent" : ""}`}
        style={{
          y,
          backgroundColor: isEmptyBlock || useTagColors ? undefined : getScoreColor(block?.score, block?.status),
          boxShadow: isEmptyBlock
            ? undefined
            : isCurrentSlot
              ? "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(var(--primary-rgb),0.18), 0 14px 30px rgba(15,23,42,0.08)"
              : "inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 30px rgba(15,23,42,0.08)",
        }}
      >
        {!isEmptyBlock && useTagColors ? <TagColorStack tags={tags} className="rounded-[20px]" /> : null}

        {isCurrentSlot && isEmptyBlock && <div className="absolute inset-0 bg-[rgba(var(--primary-rgb),0.08)]" />}

        <AnimatePresence>
          {isCharging && (
            <ChargingOverlay progress={chargeProgress} score={currentChargeScore} isComplete={chargeProgress >= 0.98} />
          )}
        </AnimatePresence>

        {!isEmptyBlock && (
          <div className="relative z-10 flex w-full items-center justify-between">
            <MiniStarDisplay score={block?.score ?? 0} size={12} color={useTagColors ? "white" : "currentColor"} />
            <div className="flex gap-0.5 text-[15px] leading-none text-white">
              {tags.map((tag) => (
                <span key={tag.id}>{tag.emoji}</span>
              ))}
            </div>
          </div>
        )}
      </motion.button>
    </div>
  );
}
