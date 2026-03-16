"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChargingOverlayProps {
  progress: number;
  score: number;
  isComplete: boolean;
}

export default function ChargingOverlay({ progress, score, isComplete }: ChargingOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden rounded-inherit">
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: progress * 0.4 }}
        className="absolute inset-0 bg-[var(--primary-color)] mix-blend-overlay"
      />

      {/* Growing Ring */}
      <svg className="w-12 h-12 sm:w-16 sm:h-16 -rotate-90 scale-150 sm:scale-100">
        <circle
          cx="50%"
          cy="50%"
          r="38%"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-white/10"
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r="38%"
          fill="none"
          stroke="var(--primary-color)"
          strokeWidth="4"
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - (progress * 100) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_var(--primary-glow)]"
        />
      </svg>

      {/* Score Text/Hint */}
      <AnimatePresence>
        {score > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute bottom-2 flex flex-col items-center"
          >
            <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">
              {score === 1 ? "汇聚完成" : "能量汇聚中"}
            </span>
            <span className="text-sm font-black text-white drop-shadow-md">{score.toFixed(2)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Starburst Particles on Complete */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ transform: `rotate(${i * 45}deg) translateY(0px)`, opacity: 1, scale: 1 }}
                animate={{ transform: `rotate(${i * 45}deg) translateY(40px)`, opacity: 0, scale: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute w-1 h-3 bg-white rounded-full"
              />
            ))}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 2, 0], opacity: [1, 0.5, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute w-20 h-20 bg-white/30 rounded-full blur-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
