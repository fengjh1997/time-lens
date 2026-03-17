"use client";

import { useCallback, useRef, useState } from "react";
import type { Score } from "@/types";

interface UseLongPressChargeProps {
  onChargeComplete: (score: Score) => void;
  onChargeStep?: (score: Score) => void;
  onStart?: () => void;
  onCancel?: () => void;
}

const STEP_MAP: Array<{ threshold: number; score: Score }> = [
  { threshold: 760, score: 1 },
  { threshold: 560, score: 0.75 },
  { threshold: 360, score: 0.5 },
  { threshold: 180, score: 0.25 },
];

export function useLongPressCharge({
  onChargeComplete,
  onChargeStep,
  onStart,
  onCancel,
}: UseLongPressChargeProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [currentChargeScore, setCurrentChargeScore] = useState<Score>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const activeRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopCharging = useCallback(
    (completed = false) => {
      clearTimer();

      if (!activeRef.current) return currentChargeScore;

      const elapsed = Date.now() - startTimeRef.current;
      const finalScore =
        completed || elapsed >= STEP_MAP[0].threshold
          ? 1
          : elapsed >= STEP_MAP[1].threshold
            ? 0.75
            : elapsed >= STEP_MAP[2].threshold
              ? 0.5
              : elapsed >= STEP_MAP[3].threshold
                ? 0.25
                : 0;

      if (!completed) {
        if (finalScore > 0) {
          onChargeComplete(finalScore);
        } else {
          onCancel?.();
        }
      }

      activeRef.current = false;
      setIsCharging(false);
      setChargeProgress(0);
      setCurrentChargeScore(0);
      return finalScore;
    },
    [currentChargeScore, onCancel, onChargeComplete],
  );

  const startCharging = useCallback(() => {
    if (activeRef.current) return;

    activeRef.current = true;
    startTimeRef.current = Date.now();
    setIsCharging(true);
    setChargeProgress(0);
    setCurrentChargeScore(0);
    onStart?.();

    const tick = () => {
      if (!activeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const nextProgress = Math.min(elapsed / STEP_MAP[0].threshold, 1);
      setChargeProgress(nextProgress);

      const nextScore =
        elapsed >= STEP_MAP[0].threshold
          ? 1
          : elapsed >= STEP_MAP[1].threshold
            ? 0.75
            : elapsed >= STEP_MAP[2].threshold
              ? 0.5
              : elapsed >= STEP_MAP[3].threshold
                ? 0.25
                : 0;

      setCurrentChargeScore((previous) => {
        if (previous !== nextScore) {
          onChargeStep?.(nextScore);
        }
        return nextScore;
      });

      if (elapsed >= STEP_MAP[0].threshold) {
        onChargeComplete(1);
        stopCharging(true);
        return;
      }

      timerRef.current = setTimeout(tick, 16);
    };

    timerRef.current = setTimeout(tick, 16);
  }, [onChargeComplete, onChargeStep, onStart, stopCharging]);

  return {
    isCharging,
    chargeProgress,
    currentChargeScore,
    startCharging,
    stopCharging,
  };
}
