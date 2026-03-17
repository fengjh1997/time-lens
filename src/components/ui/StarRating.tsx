"use client";

import { useId } from "react";
import type { Score } from "@/types";

interface StarRatingProps {
  value: Score;
  onChange?: (value: Score) => void;
  size?: number;
  interactive?: boolean;
}

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const SCORES: Score[] = [-1, 0, 0.25, 0.5, 0.75, 1];

const SCORE_DISPLAY: Record<Score, { label: string; shortLabel: string }> = {
  "-1": { label: "透支", shortLabel: "惩罚" },
  "0": { label: "空白", shortLabel: "留白" },
  "0.25": { label: "启动", shortLabel: "0.25" },
  "0.5": { label: "稳定", shortLabel: "0.50" },
  "0.75": { label: "专注", shortLabel: "0.75" },
  "1": { label: "心流", shortLabel: "1.00" },
};

function StarIcon({
  fill = 0,
  broken = false,
  size = 24,
  glow = false,
  color,
  clipSeed = "star",
}: {
  fill?: number;
  broken?: boolean;
  size?: number;
  glow?: boolean;
  color?: string;
  clipSeed?: string;
}) {
  const starColor = color || "var(--primary-color)";

  if (broken) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={STAR_PATH} fill="#666" opacity={0.3} stroke="#888" strokeWidth={1.5} />
        <line x1="8" y1="6" x2="16" y2="18" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <line x1="10" y1="14" x2="15" y2="8" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      </svg>
    );
  }

  if (fill === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.25} />
      </svg>
    );
  }

  const clipId = `star-clip-${clipSeed}-${fill}`;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {glow && (
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.15} />
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill={starColor} clipPath={`url(#${clipId})`} filter={glow ? "url(#star-glow)" : undefined} />
      <path d={STAR_PATH} fill="none" stroke={starColor} strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

export default function StarRating({
  value,
  onChange,
  size = 32,
  interactive = true,
}: StarRatingProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {SCORES.map((score) => {
          const isSelected = value === score;
          const display = SCORE_DISPLAY[score];
          return (
            <button
              key={score}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(score)}
              className={`flex flex-col items-center gap-2 rounded-[22px] px-2 py-4 transition-all ${
                isSelected
                  ? "bg-[var(--primary-light)] ring-2 ring-[var(--primary-color)] shadow-lg shadow-[var(--primary-glow)]"
                  : "bg-black/[0.03] opacity-70 hover:bg-black/[0.05] hover:opacity-100 dark:bg-white/[0.05]"
              }`}
            >
              <StarIcon
                fill={score <= 0 ? 0 : score}
                broken={score === -1}
                size={size}
                glow={isSelected && score === 1}
                clipSeed={`rating-${score}`}
              />
              <span className={`text-[11px] font-black ${isSelected ? "text-[var(--primary-color)]" : "text-gray-400"}`}>
                {display.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <span className="rounded-full border border-[var(--border-color)] bg-black/[0.03] px-4 py-1.5 text-[12px] font-black text-gray-500 dark:bg-white/[0.05]">
          {SCORE_DISPLAY[value].label}
        </span>
      </div>
    </div>
  );
}

export function MiniStarDisplay({ score, size = 14, color }: { score: Score; size?: number; color?: string }) {
  const id = useId();
  if (score === -1) return <StarIcon broken size={size} color={color} clipSeed={id} />;
  if (score === 0) return <StarIcon fill={0} size={size} color={color} clipSeed={id} />;
  return <StarIcon fill={score} size={size} color={color} clipSeed={id} />;
}

export function EnergyDisplay({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const display = decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
  const id = useId();
  return (
    <span className="inline-flex items-center gap-2">
      <StarIcon fill={1} size={18} clipSeed={id} />
      <span className="font-black tabular-nums tracking-tight">{display}</span>
    </span>
  );
}
