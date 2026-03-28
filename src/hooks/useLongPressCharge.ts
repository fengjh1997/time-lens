"use client";

import { useCallback, useRef, useState } from "react";
import type { Score } from "@/types";

interface UseLongPressChargeProps {
  onChargeComplete: (score: Score) => void;
  onChargeStep?: (score: Score) => void;
  onStart?: () => void;
  onCancel?: () => void;
  resolveTargetScore?: (baseScore: Score) => Score;
  stepThreshold?: number;
}

const STEP_THRESHOLD = 180;

function getNextScore(baseScore: Score): Score {
  if (baseScore === 1) return 1;
  if (baseScore === 0.75) return 1;
  if (baseScore === 0.5) return 0.75;
  if (baseScore === 0.25) return 0.5;
  return 0.25;
}

export function useLongPressCharge({
  onChargeComplete,
  onChargeStep,
  onStart,
  onCancel,
  resolveTargetScore,
  stepThreshold = STEP_THRESHOLD,
}: UseLongPressChargeProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const [currentChargeScore, setCurrentChargeScore] = useState<Score>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const activeRef = useRef(false);
  const baseScoreRef = useRef<Score>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelCharging = useCallback(() => {
    if (!activeRef.current) return;
    clearTimer();
    activeRef.current = false;
    setIsCharging(false);
    setChargeProgress(0);
    setCurrentChargeScore(0);
    onCancel?.();
  }, [onCancel]);

  const stopCharging = useCallback(() => {
    clearTimer();
    if (!activeRef.current) return 0 as Score;

    const elapsed = Date.now() - startTimeRef.current;
    const nextScore = resolveTargetScore ? resolveTargetScore(baseScoreRef.current) : getNextScore(baseScoreRef.current);
    const finalScore = elapsed >= stepThreshold ? nextScore : (0 as Score);

    if (finalScore > 0) {
      onChargeComplete(finalScore);
    } else {
      onCancel?.();
    }

    activeRef.current = false;
    setIsCharging(false);
    setChargeProgress(0);
    setCurrentChargeScore(0);
    return finalScore;
  }, [onCancel, onChargeComplete, resolveTargetScore, stepThreshold]);

  const startCharging = useCallback(
    (baseScore: Score = 0) => {
      if (activeRef.current) return;

      activeRef.current = true;
      baseScoreRef.current = baseScore;
      startTimeRef.current = Date.now();
      setIsCharging(true);
      setChargeProgress(0);
      const nextScore = resolveTargetScore ? resolveTargetScore(baseScore) : getNextScore(baseScore);
      setCurrentChargeScore(nextScore);
      onStart?.();

      const tick = () => {
        if (!activeRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const nextProgress = Math.min(elapsed / stepThreshold, 1);
        setChargeProgress(nextProgress);
        onChargeStep?.(resolveTargetScore ? resolveTargetScore(baseScoreRef.current) : getNextScore(baseScoreRef.current));
        timerRef.current = setTimeout(tick, 16);
      };

      timerRef.current = setTimeout(tick, 16);
    },
    [onChargeStep, onStart, resolveTargetScore, stepThreshold],
  );

  return {
    isCharging,
    chargeProgress,
    currentChargeScore,
    startCharging,
    stopCharging,
    cancelCharging,
  };
}
