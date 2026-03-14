"use client";

import { type Score } from "@/types";

interface StarRatingProps {
  value: Score;
  onChange?: (value: Score) => void;
  size?: number;
  interactive?: boolean;
}

// SVG Star paths
const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const SCORES: Score[] = [-1, 0, 0.25, 0.5, 0.75, 1];

const SCORE_DISPLAY: Record<Score, { label: string; shortLabel: string }> = {
  "-1": { label: "荒废内耗", shortLabel: "✕" },
  "0":  { label: "空闲", shortLabel: "○" },
  "0.25": { label: "轻度维持", shortLabel: "¼" },
  "0.5": { label: "常规输出", shortLabel: "½" },
  "0.75": { label: "高效专注", shortLabel: "¾" },
  "1": { label: "心流状态", shortLabel: "★" },
};

function StarIcon({ fill = 0, broken = false, size = 24, glow = false }: { fill?: number; broken?: boolean; size?: number; glow?: boolean }) {
  if (broken) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={STAR_PATH} fill="#666" opacity={0.3} stroke="#888" strokeWidth={1.5} />
        {/* Crack line */}
        <line x1="8" y1="6" x2="16" y2="18" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <line x1="10" y1="14" x2="15" y2="8" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      </svg>
    );
  }

  if (fill === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.25} />
      </svg>
    );
  }

  const clipId = `star-clip-${Math.random().toString(36).slice(2)}`;
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {glow && (
        <filter id="star-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      {/* Background star outline */}
      <path d={STAR_PATH} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.15} />
      {/* Filled portion */}
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path 
        d={STAR_PATH} 
        fill="#f59e0b" 
        clipPath={`url(#${clipId})`}
        filter={glow ? "url(#star-glow)" : undefined}
      />
      <path d={STAR_PATH} fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

export default function StarRating({ value, onChange, size = 32, interactive = true }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2">
        {SCORES.map(score => {
          const isSelected = value === score;
          const display = SCORE_DISPLAY[score];
          
          return (
            <button
              key={score}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(score)}
              className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all duration-300 ease-out
                ${isSelected 
                  ? 'bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-400 dark:ring-amber-600 scale-[1.08] shadow-md shadow-amber-200/30 dark:shadow-amber-900/30' 
                  : 'bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:scale-[1.04] opacity-60 hover:opacity-100'
                }
              `}
            >
              <StarIcon 
                fill={score === -1 ? 0 : score === 0 ? 0 : score} 
                broken={score === -1}
                size={size}
                glow={isSelected && score === 1}
              />
              <span className={`text-[11px] font-bold tracking-tight ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                {display.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Selected label */}
      <div className="text-center">
        <span className="text-[13px] font-bold text-gray-500 bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1 rounded-full">
          {SCORE_DISPLAY[value].label}
          {value > 0 && ` (+${value})`}
          {value === -1 && " (-1)"}
        </span>
      </div>
    </div>
  );
}

// Mini star for inline display (e.g. in grid cells)
export function MiniStarDisplay({ score, size = 14 }: { score: Score; size?: number }) {
  if (score === -1) return <StarIcon broken size={size} />;
  if (score === 0) return <StarIcon fill={0} size={size} />;
  return <StarIcon fill={score} size={size} />;
}

export function EnergyDisplay({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const display = decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
        <path d={STAR_PATH} />
      </svg>
      <span className="font-black tabular-nums">{display}</span>
    </span>
  );
}
