"use client";

import { useState, useRef, useCallback } from 'react';
import { Score } from '@/types';

interface UseLongPressChargeProps {
  onChargeComplete: (score: Score) => void;
  onChargeStep?: (score: Score) => void;
  onStart?: () => void;
  onCancel?: () => void;
}

export function useLongPressCharge({
  onChargeComplete,
  onChargeStep,
  onStart,
  onCancel
}: UseLongPressChargeProps) {
  const [isCharging, setIsCharging] = useState(false);
  const isChargingRef = useRef(false);
  const [chargeProgress, setChargeProgress] = useState(0); 
  const [currentChargeScore, setCurrentChargeScore] = useState<Score>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startCharging = useCallback(() => {
    if (isChargingRef.current) return;
    
    setIsCharging(true);
    isChargingRef.current = true;
    setChargeProgress(0);
    setCurrentChargeScore(0);
    startTimeRef.current = Date.now();
    onStart?.();

    const updateProgress = () => {
      if (!isChargingRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / 800, 1);
      setChargeProgress(progress);

      let newScore: Score = 0;
      if (elapsed >= 800) newScore = 1;
      else if (elapsed >= 600) newScore = 0.75;
      else if (elapsed >= 400) newScore = 0.5;
      else if (elapsed >= 200) newScore = 0.25;

      if (newScore !== currentChargeScore) {
        setCurrentChargeScore(newScore);
        onChargeStep?.(newScore);
      }

      if (elapsed >= 800) {
        onChargeComplete(1);
        stopCharging(true);
        return;
      }

      timerRef.current = setTimeout(updateProgress, 16);
    };

    timerRef.current = setTimeout(updateProgress, 16);
  }, [onChargeComplete, onChargeStep, onStart, currentChargeScore]);

  const stopCharging = useCallback((completed = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!completed && isChargingRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 200) {
        onCancel?.();
      } else {
        // Commit whatever score reached
        onChargeComplete(currentChargeScore);
      }
    }

    setIsCharging(false);
    isChargingRef.current = false;
    setChargeProgress(0);
    setCurrentChargeScore(0);
  }, [currentChargeScore, onChargeComplete, onCancel]);

  return {
    isCharging,
    chargeProgress,
    currentChargeScore,
    startCharging,
    stopCharging
  };
}
