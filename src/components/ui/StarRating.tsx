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
  "0":  { label: "空闲", shortLabel: "" },
  "0.25": { label: "轻度维持", shortLabel: "¼" },
  "0.5": { label: "常规输出", shortLabel: "½" },
  "0.75": { label: "高效专注", shortLabel: "¾" },
  "1": { label: "心流状态", shortLabel: "★" },
};

function StarIcon({ fill = 0, broken = false, size = 24, glow = false, color }: { fill?: number; broken?: boolean; size?: number; glow?: boolean; color?: string }) {
  const starColor = color || "var(--primary-color)";
  
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
          <feGaussianBlur stdDeviation="2.5" result="blur" />
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
        fill={starColor} 
        clipPath={`url(#${clipId})`}
        filter={glow ? "url(#star-glow)" : undefined}
      />
      <path d={STAR_PATH} fill="none" stroke={starColor} strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

export default function StarRating({ value, onChange, size = 32, interactive = true }: StarRatingProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 gap-3">
        {SCORES.map(score => {
          const isSelected = value === score;
          const display = SCORE_DISPLAY[score];
          
          return (
            <button
              key={score}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(score)}
              className={`flex flex-col items-center gap-2 py-4 px-1 rounded-[24px] transition-all duration-500 ease-out
                ${isSelected 
                  ? 'bg-[var(--primary-light)] ring-2 ring-[var(--primary-color)] scale-[1.1] shadow-xl shadow-[var(--primary-glow)] z-10' 
                  : 'bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:scale-[1.05] opacity-50 hover:opacity-100'
                }
              `}
            >
              <StarIcon 
                fill={score === -1 ? 0 : score === 0 ? 0 : score} 
                broken={score === -1}
                size={size}
                glow={isSelected && score === 1}
              />
              <span className={`text-[12px] font-black tracking-tight ${isSelected ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                {display.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Selected label */}
      <div className="flex justify-center">
        <span className="text-[12px] font-black text-gray-400 bg-black/[0.03] dark:bg-white/[0.05] border border-[var(--border-color)] px-4 py-1.5 rounded-full tracking-wider uppercase">
          {SCORE_DISPLAY[value].label}
          {value > 0 && ` (+${value}★)`}
          {value === -1 && " (-1★)"}
        </span>
      </div>
    </div>
  );
}

// Mini star for inline display (e.g. in grid cells)
export function MiniStarDisplay({ score, size = 14, color }: { score: Score; size?: number; color?: string }) {
  if (score === -1) return <StarIcon broken size={size} color={color} />;
  if (score === 0) return <StarIcon fill={0} size={size} color={color} />;
  return <StarIcon fill={score} size={size} color={color} />;
}

export function EnergyDisplay({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const display = decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
  return (
    <span className="inline-flex items-center gap-2">
      <StarIcon fill={1} size={18} />
      <span className="font-black tabular-nums tracking-tight">{display}</span>
    </span>
  );
}
