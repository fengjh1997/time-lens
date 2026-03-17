"use client";

import { motion } from "framer-motion";

interface ChargingOverlayProps {
  progress: number;
  score: number;
  isComplete: boolean;
}

export default function ChargingOverlay({ progress, isComplete }: ChargingOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 + progress * 0.2 }}
        className="absolute inset-0 bg-[var(--primary-color)]"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: 0.75 + progress * 0.75 + index * 0.14,
              opacity: 0.22 + progress * 0.18 - index * 0.05,
            }}
            className="absolute h-16 w-16 rounded-full border border-white/50 sm:h-20 sm:w-20"
          />
        ))}
      </div>

      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.7, scale: 0.6 }}
              animate={{ opacity: 0, scale: 1.8 + index * 0.16 }}
              transition={{ duration: 0.42, ease: "easeOut", delay: index * 0.04 }}
              className="absolute h-18 w-18 rounded-full border border-white/60 sm:h-24 sm:w-24"
            />
          ))}
        </div>
      )}
    </div>
  );
}
