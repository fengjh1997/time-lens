"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion";
import { Plus } from "lucide-react";
import RecordModal from "./RecordModal";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import TagColorStack from "@/components/ui/TagColorStack";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import { useSync } from "@/hooks/useSync";
import { blockMatchesTagFilter, getBlockTags } from "@/lib/blockTags";
import { useTimeStore } from "@/store/timeStore";
import type { Score, Tag, TimeBlock } from "@/types";

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];

function getScoreColor(score?: Score) {
  if (score === undefined || score === 0) return "transparent";
  if (score === -1) return "var(--score-punish)";
  if (score === 0.25) return "var(--score-1)";
  if (score === 0.5) return "var(--score-2)";
  if (score === 0.75) return "var(--score-3)";
  return "var(--score-4)";
}

interface DayGridProps {
  dateStr?: string;
  selectedTagIds?: string[];
}

export default function DayGrid({
  dateStr = new Date().toISOString().split("T")[0],
  selectedTagIds = [],
}: DayGridProps) {
  const { blocks, saveBlock, deleteBlock, tags, settings } = useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedHour, setSelectedHour] = useState<number | string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleHours = settings.hideSleepTime
    ? ALL_HOURS.filter((hour) => !SLEEP_HOURS.includes(hour))
    : ALL_HOURS;

  const getVisibleBlock = (block?: TimeBlock | null) =>
    blockMatchesTagFilter(block, selectedTagIds) ? (block ?? undefined) : undefined;

  const handleDragUpdate = (fromHour: number, toHour: number) => {
    if (fromHour === toHour) return;
    const fromKey = `${dateStr}-${fromHour}`;
    const block = blocks[fromKey];
    if (!block) return;

    const nextBlock: TimeBlock = {
      ...block,
      id: `${dateStr}-${toHour}`,
      hourId: toHour,
      updatedAt: new Date().toISOString(),
    };

    deleteBlock(dateStr, block.id);
    saveBlock(dateStr, nextBlock);
    deleteCloudBlock(block.id);
    pushBlock(nextBlock, dateStr);
  };

  const handleChargeSave = (hourId: number | string, score: Score) => {
    const key = `${dateStr}-${String(hourId)}`;
    const existing = blocks[key];
    const nextBlock: TimeBlock = existing
      ? { ...existing, score, status: "completed", updatedAt: new Date().toISOString() }
      : { id: key, hourId, content: "", score, status: "completed", updatedAt: new Date().toISOString() };
    saveBlock(dateStr, nextBlock);
    pushBlock(nextBlock, dateStr);
  };

  const activeBlockKey = selectedHour === null ? null : `${dateStr}-${String(selectedHour)}`;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;
  const bonusBlock = blocks[`${dateStr}-bonus`];

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(block) => {
          saveBlock(dateStr, block);
          pushBlock(block, dateStr);
        }}
        onDelete={(id) => {
          deleteBlock(dateStr, id);
          deleteCloudBlock(id);
          setIsModalOpen(false);
        }}
        initialData={activeBlock}
        dateStr={dateStr}
        hourIdx={typeof selectedHour === "number" ? selectedHour : 0}
        hourId={selectedHour ?? undefined}
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-4 sm:px-6">
        <section className="timeline-main rounded-[34px]">
          <div className="space-y-3">
            {visibleHours.map((hour) => (
              <DayTimelineCell
                key={hour}
                hour={hour}
                block={getVisibleBlock(blocks[`${dateStr}-${hour}`])}
                tags={getBlockTags(getVisibleBlock(blocks[`${dateStr}-${hour}`]), tags)}
                isCurrentHour={dateStr === new Date().toISOString().split("T")[0] && hour === new Date().getHours()}
                isSleep={SLEEP_HOURS.includes(hour)}
                allVisibleHours={visibleHours}
                useTagColors={selectedTagIds.length > 0}
                onOpen={() => {
                  setSelectedHour(hour);
                  setIsModalOpen(true);
                }}
                onCharge={handleChargeSave}
                onDragMove={handleDragUpdate}
              />
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            setSelectedHour("bonus");
            setIsModalOpen(true);
          }}
          className="glass-card flex items-center justify-between rounded-[28px] px-4 py-4 no-select"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary-color)]">
              <Plus size={15} />
            </div>
            <span className="text-sm font-black">{bonusBlock?.content || "Bonus"}</span>
          </div>
          {bonusBlock ? <MiniStarDisplay score={bonusBlock.score} size={18} /> : <Plus size={16} className="text-[var(--primary-color)]" />}
        </button>
      </div>
    </div>
  );
}

function DayTimelineCell({
  hour,
  block,
  tags,
  isCurrentHour,
  isSleep,
  allVisibleHours,
  useTagColors,
  onOpen,
  onCharge,
  onDragMove,
}: {
  hour: number;
  block?: TimeBlock;
  tags: Tag[];
  isCurrentHour: boolean;
  isSleep: boolean;
  allVisibleHours: number[];
  useTagColors: boolean;
  onOpen: () => void;
  onCharge: (hourId: number, score: Score) => void;
  onDragMove: (fromHour: number, toHour: number) => void;
}) {
  const dragControls = useDragControls();
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartedRef = useRef(false);
  const rowHeightRef = useRef(94);
  const dragSnapIndexRef = useRef<number | null>(null);
  const y = useMotionValue(0);
  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging, cancelCharging } =
    useLongPressCharge({ onChargeComplete: (score) => onCharge(hour, score) });

  const isPlanned = block?.status === "planned";
  const isCompleted = block?.status === "completed";
  const isEmptyBlock = !block || (!block.content?.trim() && tags.length === 0 && block.score === 0 && block.status !== "planned");
  const detailText = block?.content?.trim() || "";
  const currentIndex = allVisibleHours.indexOf(hour);

  return (
    <div className={`relative flex gap-4 ${isSleep ? "opacity-55" : ""}`}>
      <div className="w-10 pt-4 text-right text-[12px] font-black text-faint">{String(hour).padStart(2, "0")}</div>
      <div className="relative pt-5">
        <div className={`h-3 w-3 rounded-full border ${isCurrentHour ? "border-[var(--primary-color)] bg-[var(--primary-color)] shadow-[0_0_0_6px_rgba(var(--primary-rgb),0.12)]" : "border-[var(--border-color)] bg-[var(--panel-elevated)]"}`} />
      </div>

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
          rowHeightRef.current = event.currentTarget.parentElement?.getBoundingClientRect().height || 94;
          dragSnapIndexRef.current = currentIndex;
          pointerStartRef.current = { x: event.clientX, y: event.clientY };
          dragStartedRef.current = false;
          startCharging(block?.status === "completed" ? block.score : 0);
        }}
        onPointerMove={(event) => {
          if (!pointerStartRef.current || !block) return;
          const dx = event.clientX - pointerStartRef.current.x;
          const dy = event.clientY - pointerStartRef.current.y;
          if (Math.hypot(dx, dy) > 9 && !dragStartedRef.current) {
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
          const targetIndex = dragSnapIndexRef.current ?? currentIndex;
          y.set(0);
          dragSnapIndexRef.current = null;
          if (targetIndex !== currentIndex) onDragMove(hour, allVisibleHours[targetIndex]);
          dragStartedRef.current = false;
          pointerStartRef.current = null;
        }}
        className={`relative min-h-[82px] flex-1 overflow-hidden rounded-[30px] px-4 py-4 text-left no-select select-none [touch-action:none] ${
          isEmptyBlock
            ? "border border-[#d9d6ce] bg-[#e8e4db] shadow-none dark:border-[#27303b] dark:bg-[#161c24]"
            : "border border-[rgba(var(--primary-rgb),0.14)] shadow-[0_18px_36px_rgba(15,23,42,0.09)]"
        } ${isPlanned ? "border border-dashed border-[var(--primary-color)]" : ""} ${isCurrentHour ? "ring-2 ring-[rgba(var(--primary-rgb),0.34)] ring-offset-2 ring-offset-transparent" : ""}`}
        style={{
          y,
          backgroundColor: isEmptyBlock || useTagColors ? undefined : getScoreColor(block?.score),
          boxShadow: isEmptyBlock
            ? undefined
            : isCurrentHour
              ? "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(var(--primary-rgb),0.18), 0 18px 36px rgba(15,23,42,0.09)"
              : "inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 36px rgba(15,23,42,0.09)",
          color: useTagColors || (isCompleted && block?.score && (block.score >= 0.75 || block.score === -1)) ? "white" : "var(--foreground)",
        }}
      >
        {!isEmptyBlock && useTagColors ? (
          <TagColorStack tags={tags} className="rounded-[30px]" />
        ) : null}

        {isCurrentHour && isEmptyBlock && (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.12),transparent_72%)]" />
        )}

        <AnimatePresence>
          {isCharging && (
            <ChargingOverlay progress={chargeProgress} score={currentChargeScore} isComplete={chargeProgress >= 0.98} />
          )}
        </AnimatePresence>

        {!isEmptyBlock && (
          <div className="relative z-10 flex h-full items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1 text-[18px] leading-none">
                {tags.map((tag) => (
                  <span key={tag.id}>{tag.emoji}</span>
                ))}
              </div>
              {detailText ? (
                <p className={`mt-3 truncate text-[12px] font-medium leading-tight ${useTagColors ? "text-white/88" : "text-subtle"}`}>
                  {detailText}
                </p>
              ) : null}
            </div>

            {isCompleted && block?.score !== 0 && (
              <div className="rounded-full bg-black/10 px-3 py-1.5 dark:bg-white/10">
                <MiniStarDisplay score={block.score} size={16} />
              </div>
            )}
          </div>
        )}
      </motion.button>
    </div>
  );
}
