"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Star } from "lucide-react";
import CanvasTopBar from "@/components/layout/CanvasTopBar";
import RecordModal from "@/components/grid/RecordModal";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import { useSync } from "@/hooks/useSync";
import { useTimeStore } from "@/store/timeStore";
import type { Score, TimeBlock } from "@/types";

const ALL_HOURS = Array.from({ length: 24 }, (_, index) => index);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const INNER_TOTAL = 12;
const OUTER_TOTAL = 20;

type ConstellationStar = {
  id: string;
  x: number;
  y: number;
  size: number;
  active: boolean;
  ring: "day" | "week";
  float: number;
  drift: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

const INNER_LAYOUT = [
  { x: 26, y: 34, size: 22 },
  { x: 38, y: 23, size: 16 },
  { x: 61, y: 20, size: 18 },
  { x: 77, y: 30, size: 20 },
  { x: 70, y: 48, size: 14 },
  { x: 80, y: 58, size: 16 },
  { x: 64, y: 70, size: 20 },
  { x: 43, y: 77, size: 18 },
  { x: 23, y: 68, size: 19 },
  { x: 16, y: 50, size: 15 },
  { x: 31, y: 56, size: 13 },
  { x: 56, y: 60, size: 15 },
];

const OUTER_LAYOUT = [
  { x: 10, y: 18, size: 14 },
  { x: 18, y: 11, size: 12 },
  { x: 30, y: 8, size: 13 },
  { x: 48, y: 9, size: 11 },
  { x: 66, y: 12, size: 14 },
  { x: 84, y: 18, size: 13 },
  { x: 90, y: 34, size: 12 },
  { x: 86, y: 49, size: 11 },
  { x: 89, y: 66, size: 13 },
  { x: 79, y: 79, size: 12 },
  { x: 61, y: 86, size: 14 },
  { x: 44, y: 89, size: 12 },
  { x: 24, y: 86, size: 13 },
  { x: 10, y: 78, size: 11 },
  { x: 6, y: 62, size: 12 },
  { x: 7, y: 45, size: 11 },
  { x: 9, y: 30, size: 13 },
  { x: 20, y: 24, size: 12 },
  { x: 73, y: 26, size: 11 },
  { x: 57, y: 80, size: 12 },
];

function getVisibleHours(hideSleepTime: boolean) {
  return hideSleepTime ? ALL_HOURS.filter((hour) => !SLEEP_HOURS.includes(hour)) : ALL_HOURS;
}

function getActiveScore(block?: TimeBlock): Score {
  return block?.status === "completed" ? block.score : 0;
}

function getWeekDates(anchor: Date) {
  const current = new Date(anchor);
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + mondayOffset);
  current.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(current);
    date.setDate(current.getDate() + index);
    return date.toISOString().split("T")[0];
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildConstellationStars(
  layout: Array<{ x: number; y: number; size: number }>,
  activeCount: number,
  ring: "day" | "week",
): ConstellationStar[] {
  return layout.map((star, index) => ({
    id: `${ring}-${index}`,
    x: star.x,
    y: star.y,
    size: star.size,
    active: index < activeCount,
    ring,
    float: 3 + (index % 3),
    drift: index % 2 === 0 ? 1 : -1,
  }));
}

function getRepelOffset(star: ConstellationStar, pointer: PointerState) {
  if (!pointer.active) return { dx: 0, dy: 0 };

  const radius = star.ring === "day" ? 14 : 11;
  const dx = star.x - pointer.x;
  const dy = star.y - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0 || distance > radius) return { dx: 0, dy: 0 };

  const force = (1 - distance / radius) * (star.ring === "day" ? 16 : 11);
  return {
    dx: (dx / distance) * force,
    dy: (dy / distance) * force,
  };
}

export default function NowPage() {
  const { blocks, settings, saveBlock, deleteBlock, getDayEnergy, getWeekEnergy } = useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [pointer, setPointer] = useState<PointerState>({ active: false, x: 50, y: 50 });

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const visibleHours = getVisibleHours(settings.hideSleepTime);
  const safeIndex = Math.max(0, visibleHours.findIndex((hour) => hour >= currentHour));
  const currentSlot = visibleHours[safeIndex] ?? currentHour;
  const nextVisibleSlot =
    visibleHours[Math.min(visibleHours.length - 1, safeIndex + 1)] ?? ((currentSlot + 1) % 24);
  const currentBlock = blocks[`${today}-${currentSlot}`];
  const weekDates = getWeekDates(new Date(`${today}T00:00:00`));
  const dayEnergy = getDayEnergy(today);
  const weekEnergy = getWeekEnergy(weekDates);
  const dayStarCount = clamp(Math.round(Math.max(dayEnergy, 0) * 1.9), 0, INNER_TOTAL);
  const weekStarCount = clamp(Math.round(Math.max(weekEnergy, 0) * 0.72), 0, OUTER_TOTAL);
  const dayStars = useMemo(() => buildConstellationStars(INNER_LAYOUT, dayStarCount, "day"), [dayStarCount]);
  const weekStars = useMemo(() => buildConstellationStars(OUTER_LAYOUT, weekStarCount, "week"), [weekStarCount]);

  const handleChargeSave = (score: Score) => {
    const key = `${today}-${currentSlot}`;
    const existing = blocks[key];
    const nextScore = score === 0 ? 1 : score;
    const nextBlock: TimeBlock = existing
      ? { ...existing, score: nextScore, status: "completed", updatedAt: new Date().toISOString() }
      : {
          id: key,
          hourId: currentSlot,
          content: "",
          score: nextScore,
          status: "completed",
          updatedAt: new Date().toISOString(),
        };
    saveBlock(today, nextBlock);
    pushBlock(nextBlock, today);
  };

  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging, cancelCharging } =
    useLongPressCharge({
      onChargeComplete: handleChargeSave,
      resolveTargetScore: () => 1,
      stepThreshold: 280,
    });

  const displayScore = currentChargeScore || getActiveScore(currentBlock);
  const isCoreFilled = getActiveScore(currentBlock) > 0 || (isCharging && chargeProgress > 0.72);
  const glowStrength = useMemo(() => {
    if (displayScore === -1) return 0.1;
    if (displayScore === 0) return 0.18;
    if (displayScore === 0.25) return 0.28;
    if (displayScore === 0.5) return 0.42;
    if (displayScore === 0.75) return 0.58;
    return 0.74;
  }, [displayScore]);

  useEffect(() => {
    if (!burstKey) return;
    const timeoutId = window.setTimeout(() => setBurstKey(0), 520);
    return () => window.clearTimeout(timeoutId);
  }, [burstKey]);

  const handleScenePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setPointer({
      active: true,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <CanvasTopBar
        subtitle="时流 此刻 / Current Window"
        statusLabel={`${String(currentHour).padStart(2, "0")}:00`}
        onPrev={() => window.history.back()}
        onNext={() => window.location.assign("/?view=day&offset=0")}
        onReset={() => window.location.assign("/now")}
      />

      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(block) => {
          saveBlock(today, block);
          pushBlock(block, today);
        }}
        onDelete={(id) => {
          deleteBlock(today, id);
          deleteCloudBlock(id);
          setIsModalOpen(false);
        }}
        initialData={currentBlock}
        dateStr={today}
        hourIdx={currentSlot}
        hourId={currentSlot}
      />

      <div className="flex-1 overflow-hidden px-4 pb-28 pt-4 sm:px-6 sm:pb-10">
        <section
          className="relative mx-auto flex h-full max-w-6xl flex-col overflow-hidden"
          onPointerMove={handleScenePointerMove}
          onPointerLeave={() => setPointer((current) => ({ ...current, active: false }))}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse") {
              handleScenePointerMove(event);
            }
          }}
        >
          <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden">
            {weekStars.map((star) => {
              const offset = getRepelOffset(star, pointer);
              return (
                <motion.div
                  key={star.id}
                  className="pointer-events-none absolute text-[var(--primary-color)]"
                  aria-hidden="true"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    marginLeft: -(star.size / 2),
                    marginTop: -(star.size / 2),
                    filter: star.active
                      ? `drop-shadow(0 0 ${8 + star.size * 0.42}px rgba(var(--primary-rgb),0.18))`
                      : "none",
                  }}
                  animate={{
                    x: offset.dx,
                    y: [offset.dy, offset.dy - star.float * 0.75, offset.dy],
                    opacity: star.active ? [0.62, 0.78, 0.66] : 0.12,
                    scale: star.active ? [1, 1.04, 1] : 1,
                  }}
                  transition={{
                    duration: 5.4 + (star.size % 4),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: star.size * 0.03,
                  }}
                >
                  <Star
                    size={star.size}
                    strokeWidth={1.65}
                    fill={star.active ? "currentColor" : "transparent"}
                  />
                </motion.div>
              );
            })}

            {dayStars.map((star) => {
              const offset = getRepelOffset(star, pointer);
              return (
                <motion.div
                  key={star.id}
                  className="pointer-events-none absolute text-[var(--primary-color)]"
                  aria-hidden="true"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    marginLeft: -(star.size / 2),
                    marginTop: -(star.size / 2),
                    filter: star.active
                      ? `drop-shadow(0 0 ${10 + star.size * 0.44}px rgba(var(--primary-rgb),0.26))`
                      : "none",
                  }}
                  animate={{
                    x: offset.dx,
                    y: [offset.dy, offset.dy - star.float, offset.dy],
                    opacity: star.active ? [0.8, 0.96, 0.84] : 0.18,
                    scale: star.active ? [1, 1.06, 1] : 1,
                  }}
                  transition={{
                    duration: 4.6 + (star.size % 3),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: star.size * 0.04,
                  }}
                >
                  <Star
                    size={star.size}
                    strokeWidth={1.75}
                    fill={star.active ? "currentColor" : "transparent"}
                  />
                </motion.div>
              );
            })}

            {burstKey ? (
              <motion.div
                key={burstKey}
                initial={{ opacity: 0.74, scale: 0.72 }}
                animate={{ opacity: 0, scale: 1.72 }}
                transition={{ duration: 0.56, ease: "easeOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(var(--primary-rgb),0.24)]"
              />
            ) : null}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.stopPropagation();
                setIsPressed(true);
                startCharging(getActiveScore(currentBlock));
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
                const finalScore = stopCharging();
                setIsPressed(false);
                if (finalScore > 0) setBurstKey(Date.now());
                if (finalScore <= 0) setIsModalOpen(true);
              }}
              onPointerLeave={() => {
                setIsPressed(false);
                cancelCharging();
              }}
              onPointerCancel={() => {
                setIsPressed(false);
                cancelCharging();
              }}
              className="absolute left-1/2 top-1/2 z-20 flex h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none"
            >
              <div
                className="pointer-events-none absolute h-24 w-24 rounded-full"
                style={{
                  background: `rgba(var(--primary-rgb), ${0.06 + glowStrength * 0.08})`,
                  filter: "blur(22px)",
                  opacity: 0.92,
                }}
              />

              <motion.div
                className="star-anchor star-anchor-main"
                aria-hidden="true"
                animate={{
                  rotate: isCharging ? [0, -4, 3, 0] : 0,
                  scale: isCharging ? [1, 1.08, 1.02] : isPressed ? 0.96 : 1,
                }}
                transition={{
                  duration: isCharging ? 0.82 : 0.22,
                  repeat: isCharging ? Number.POSITIVE_INFINITY : 0,
                  ease: "easeInOut",
                }}
              >
                <Star size={56} strokeWidth={1.8} fill={isCoreFilled ? "currentColor" : "transparent"} />
              </motion.div>

              {isCharging ? (
                <ChargingOverlay
                  progress={chargeProgress}
                  score={currentChargeScore}
                  isComplete={chargeProgress >= 0.98}
                  variant="star-core"
                />
              ) : null}
            </button>

            <div className="star-time-label">
              <Clock3 size={13} />
              <span>
                {String(currentSlot).padStart(2, "0")}:00 - {String(nextVisibleSlot).padStart(2, "0")}:00
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
