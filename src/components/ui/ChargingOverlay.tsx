"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ChargingOverlayProps {
  progress: number;
  score: number;
  isComplete: boolean;
  variant?: "block" | "star-core";
}

export default function ChargingOverlay({ progress, isComplete, variant = "block" }: ChargingOverlayProps) {
  if (variant === "star-core") {
    return (
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
          const angle = (index / 8) * Math.PI * 2;
          const orbit = 112 - progress * 76 + index * 1.4;
          const x = Math.cos(angle) * orbit;
          const y = Math.sin(angle) * orbit;
          const size = index % 3 === 0 ? 14 : index % 2 === 0 ? 11 : 9;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.16, scale: 0.7 }}
              animate={{
                x,
                y,
                opacity: 0.16 + progress * 0.42,
                scale: 0.8 + progress * 0.24,
                rotate: 40 - progress * 100,
              }}
              className="absolute text-[var(--primary-color)]"
              style={{ filter: "drop-shadow(0 0 8px rgba(var(--primary-rgb),0.34))" }}
            >
              <Star size={size} strokeWidth={1.7} fill="currentColor" />
            </motion.div>
          );
        })}

        {[0, 1, 2].map((index) => (
          <motion.div
            key={`pulse-${index}`}
            initial={{ opacity: 0.08, scale: 0.72 }}
            animate={{
              opacity: 0.04 + progress * 0.16,
              scale: 0.78 + progress * 0.18 + index * 0.06,
            }}
            className="absolute h-20 w-20 rounded-full border border-[rgba(var(--primary-rgb),0.14)]"
          />
        ))}

        {isComplete && (
          <>
            <motion.div
              initial={{ opacity: 0.54, scale: 0.68 }}
              animate={{ opacity: 0, scale: 1.26 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="absolute h-28 w-28 rounded-full border border-[rgba(var(--primary-rgb),0.28)]"
            />
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const angle = (index / 6) * Math.PI * 2;
              const distance = 92;
              return (
                <motion.div
                  key={`burst-${index}`}
                  initial={{ x: 0, y: 0, opacity: 0.9, scale: 0.7 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0.2,
                    rotate: 50,
                  }}
                  transition={{ duration: 0.46, ease: "easeOut" }}
                  className="absolute text-[var(--primary-color)]"
                  style={{ filter: "drop-shadow(0 0 10px rgba(var(--primary-rgb),0.38))" }}
                >
                  <Star size={12} strokeWidth={1.7} fill="currentColor" />
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    );
  }

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
