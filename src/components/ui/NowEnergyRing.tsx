"use client";

import { useId } from "react";

interface NowEnergyRingProps {
  size?: number;
  progress: number;
  className?: string;
}

export default function NowEnergyRing({
  size = 460,
  progress,
  className = "",
}: NowEnergyRingProps) {
  const gradientId = useId().replace(/:/g, "");
  const normalized = Math.max(0.06, Math.min(1, progress));
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * normalized;
  const gap = circumference - dash;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(var(--primary-rgb),0.2)" />
          <stop offset="45%" stopColor="rgb(var(--primary-rgb))" />
          <stop offset="100%" stopColor="rgba(var(--primary-rgb),0.7)" />
        </linearGradient>
      </defs>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.25"
        strokeDasharray="5 15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius - 24}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="now-energy-ring"
      />
    </svg>
  );
}
