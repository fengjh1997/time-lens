"use client";

import { motion } from "framer-motion";
import { BatteryCharging, Zap } from "lucide-react";

interface ChargingOverlayProps {
  progress: number;
  score: number;
  isComplete: boolean;
}

export default function ChargingOverlay({
  progress,
  score,
  isComplete,
}: ChargingOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-inherit">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.14 + progress * 0.3 }}
        className="absolute inset-0 bg-[var(--primary-color)]"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="h-14 w-14 -rotate-90 sm:h-16 sm:w-16">
          <circle
            cx="50%"
            cy="50%"
            r="38%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/15"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="38%"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray="100"
            animate={{ strokeDashoffset: 100 - progress * 100 }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center gap-1 text-white">
          <BatteryCharging size={22} strokeWidth={2.5} />
          {score > 0 && <span className="text-[11px] font-black tabular-nums">{score.toFixed(2)}</span>}
        </div>
      </div>

      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1, scale: 0.8, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 1.4,
                x: Math.cos((index * Math.PI) / 3) * 36,
                y: Math.sin((index * Math.PI) / 3) * 36,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute"
            >
              <Zap size={16} className="text-white" fill="currentColor" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
