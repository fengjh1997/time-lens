"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import Link from "next/link";

function getScoreColor(score: Score | undefined, status?: string) {
  if (status === 'planned') return 'transparent';
  if (score === undefined) return "var(--score-empty)";
  switch (score) {
    case -1: return "var(--score-punish)";
    case 0: return "var(--score-empty)";
    case 0.25: return "var(--score-1)";
    case 0.5: return "var(--score-2)";
    case 0.75: return "var(--score-3)";
    case 1: return "var(--score-4)";
    default: return "var(--score-empty)";
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const DAY_DATES = [
  "2026-03-16", "2026-03-17", "2026-03-18",
  "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"
];

export default function WeekGrid() {
  const { blocks, saveBlock, deleteBlock, getDayEnergy } = useTimeStore();
  const [selectedCell, setSelectedCell] = useState<{day: number, hour: number} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (day: number, hour: number) => {
    setSelectedCell({ day, hour });
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    if (selectedCell) {
      saveBlock(DAY_DATES[selectedCell.day], block);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (selectedCell) {
      const hourId = parseInt(id.split('-').pop() || "0", 10);
      deleteBlock(DAY_DATES[selectedCell.day], hourId);
      setIsModalOpen(false);
    }
  };

  const activeBlockKey = selectedCell ? `${DAY_DATES[selectedCell.day]}-${selectedCell.hour}` : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  return (
    <div className="w-full flex flex-col h-full bg-[var(--background)] relative">
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dayIdx={selectedCell?.day}
        hourIdx={selectedCell?.hour}
      />

      {/* Day Headers - clickable to navigate to day view */}
      <div className="flex border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-10 shadow-sm">
        <div className="w-14 sm:w-16 shrink-0 border-r border-[#e5e5e5] dark:border-[#333333] flex items-center justify-center bg-[var(--hover-bg)]">
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">时刻</span>
        </div>
        <div className="flex-1 grid grid-cols-7">
          {DAYS.map((day, idx) => {
            const dayEnergy = getDayEnergy(DAY_DATES[idx]);
            return (
              <Link 
                key={day} 
                href={`/day?date=${DAY_DATES[idx]}`}
                className={`py-2.5 sm:py-3 text-center border-r border-[#e5e5e5] dark:border-[#333333] last:border-r-0 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer ${idx >= 5 ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''}`}
              >
                <div className="text-[10px] sm:text-[11px] font-bold text-gray-400">{day}</div>
                <div className="text-base sm:text-lg font-black mt-0.5 text-[var(--foreground)]">{16 + idx}</div>
                {dayEnergy !== 0 && (
                  <div className={`text-[10px] font-black mt-0.5 ${dayEnergy > 0 ? 'text-amber-500' : 'text-red-400'}`}>
                    {dayEnergy > 0 ? '+' : ''}{dayEnergy.toFixed(1)}★
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="flex absolute min-w-full">
          {/* Time axis */}
          <div className="w-14 sm:w-16 shrink-0 border-r border-[#e5e5e5] dark:border-[#333333] bg-[var(--background)] relative z-10">
            {HOURS.map(hour => (
              <div key={hour} className="h-14 sm:h-16 flex items-start justify-center pt-1.5 relative">
                <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 font-bold -translate-y-1/2 bg-[var(--background)] px-1 relative z-20">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 bg-[var(--border-color)] gap-[1px]">
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className={`flex flex-col bg-[var(--background)] ${dayIdx >= 5 ? 'bg-gray-50/50 dark:bg-[#1a1a1a]' : ''}`}>
                {HOURS.map(hourIdx => {
                  const key = `${DAY_DATES[dayIdx]}-${hourIdx}`;
                  const block = blocks[key];
                  const isPlanned = block?.status === 'planned';
                  const isCompleted = block?.status === 'completed';
                  
                  return (
                    <div 
                      key={hourIdx} 
                      onClick={() => handleCellClick(dayIdx, hourIdx)}
                      className="h-14 sm:h-16 relative group cursor-pointer p-[1.5px] sm:p-[2px]"
                    >
                      <div 
                        className={`w-full h-full rounded-lg sm:rounded-[10px] transition-all duration-300 relative overflow-hidden
                          ${isPlanned ? 'border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10' : ''}
                        `}
                        style={isCompleted ? { backgroundColor: getScoreColor(block.score, block.status) } : {}}
                      >
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        {/* Content */}
                        {block && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-0.5">
                            {isCompleted && block.score !== 0 && (
                              <MiniStarDisplay score={block.score} size={12} />
                            )}
                            {isPlanned && (
                              <span className="text-[8px] sm:text-[9px] font-bold text-blue-500 dark:text-blue-400 truncate w-full text-center leading-tight">
                                {block.content}
                              </span>
                            )}
                            {isCompleted && block.score !== 0 && (
                              <span className="text-[8px] sm:text-[9px] font-bold truncate w-full text-center text-black/50 dark:text-white/70 leading-tight">
                                {block.content}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
