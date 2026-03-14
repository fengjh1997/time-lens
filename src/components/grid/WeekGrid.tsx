"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

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

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const DAYS_SHORT = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

interface WeekGridProps {
  weekDates: string[];
}

export default function WeekGrid({ weekDates }: WeekGridProps) {
  const { blocks, saveBlock, deleteBlock, getDayEnergy, settings } = useTimeStore();
  
  const [selectedCell, setSelectedCell] = useState<{date: string, hour: number | string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (date: string, hour: number | string) => {
    setSelectedCell({ date, hour });
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    if (selectedCell) {
      saveBlock(selectedCell.date, block);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (selectedCell) {
      deleteBlock(selectedCell.date, id);
      setIsModalOpen(false);
    }
  };

  const activeBlockKey = selectedCell ? (typeof selectedCell.hour === 'number' ? `${selectedCell.date}-${selectedCell.hour}` : `${selectedCell.date}-${selectedCell.hour}`) : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  const visibleHours = settings.hideSleepTime 
    ? ALL_HOURS.filter(h => !SLEEP_HOURS.includes(h))
    : ALL_HOURS;

  return (
    <div className="w-full flex flex-col h-full bg-[var(--background)] relative">
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dateStr={selectedCell?.date}
        hourIdx={typeof selectedCell?.hour === 'number' ? selectedCell.hour : 0}
        hourId={selectedCell?.hour}
      />

      {/* Day Headers */}
      <div className="flex border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)] z-10 shadow-sm">
        <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] flex items-center justify-center bg-[var(--hover-bg)]">
        </div>
        <div className="flex-1 grid grid-cols-7">
          {weekDates.map((date, idx) => {
            const dayEnergy = getDayEnergy(date);
            const dStr = date.split('-')[2];
            return (
              <Link 
                key={date} 
                href={`/day?date=${date}`}
                className={`py-2.5 sm:py-3 text-center border-r border-[var(--border-color)] last:border-r-0 hover:bg-[var(--hover-bg)] transition-colors cursor-pointer ${idx >= 5 ? 'bg-black/[0.03] dark:bg-white/[0.03]' : ''}`}
              >
                <div className="text-[10px] sm:text-[11px] font-bold text-gray-400">{DAYS_SHORT[idx]}</div>
                <div className="text-base sm:text-lg font-black mt-0.5 text-[var(--foreground)]">{dStr}</div>
                {dayEnergy !== 0 && (
                  <div className={`text-[10px] font-black mt-0.5 ${dayEnergy > 0 ? 'text-[var(--primary-color)]' : 'text-red-400'}`}>
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
          <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] bg-[var(--background)] relative z-10">
            {visibleHours.map(hour => (
              <div key={hour} className={`h-14 sm:h-16 flex items-start justify-center pt-1.5 relative ${SLEEP_HOURS.includes(hour) ? 'sleep-hour-bg' : ''}`}>
                <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 font-bold -translate-y-1/2 px-1 relative z-20">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
            {/* Bonus row header */}
            <div className="h-14 sm:h-16 flex items-center justify-center bg-[var(--primary-light)] border-t border-[var(--border-color)]">
              <span className="text-[9px] font-black text-[var(--primary-color)] vertical-text leading-none">BONUS</span>
            </div>
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 bg-[var(--border-color)] gap-[1px]">
            {weekDates.map((dateStr, dayIdx) => (
              <div key={dayIdx} className={`flex flex-col bg-[var(--background)] ${dayIdx >= 5 ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''}`}>
                {visibleHours.map(hourIdx => {
                  const key = `${dateStr}-${hourIdx}`;
                  const block = blocks[key];
                  const isPlanned = block?.status === 'planned';
                  const isCompleted = block?.status === 'completed';
                  const isSleep = SLEEP_HOURS.includes(hourIdx);
                  
                  return (
                    <div 
                      key={hourIdx} 
                      onClick={() => handleCellClick(dateStr, hourIdx)}
                      className={`h-14 sm:h-16 relative group cursor-pointer p-[1.5px] sm:p-[2px] ${isSleep ? 'sleep-hour-bg' : ''}`}
                    >
                      <div 
                        className={`w-full h-full rounded-lg sm:rounded-[10px] transition-all duration-300 relative overflow-hidden
                          ${isPlanned ? 'border-2 border-dashed border-[var(--primary-color)] opacity-60 bg-[var(--primary-light)]' : ''}
                        `}
                        style={isCompleted ? { backgroundColor: getScoreColor(block.score, block.status) } : {}}
                      >
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        {block && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-0.5">
                            {isCompleted && block.score !== 0 && (
                              <div className="flex items-center gap-0.5">
                                <MiniStarDisplay score={block.score} size={10} />
                                {block.pomodoros && block.pomodoros > 0 && (
                                  <span className="text-[8px] opacity-70">🍅x{block.pomodoros}</span>
                                )}
                              </div>
                            )}
                            <span className={`text-[8px] sm:text-[9px] font-bold truncate w-full text-center leading-tight
                              ${isPlanned ? 'text-[var(--primary-color)]' : 'text-black/50 dark:text-white/70'}
                            `}>
                              {block.content}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Bonus Cell */}
                <div 
                  onClick={() => handleCellClick(dateStr, 'bonus')}
                  className="h-14 sm:h-16 relative group cursor-pointer p-[1.5px] sm:p-[2px] bg-[var(--primary-light)] border-t border-[var(--border-color)]"
                >
                  {(() => {
                    const block = blocks[`${dateStr}-bonus`];
                    return (
                      <div className={`w-full h-full rounded-lg bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 border-dashed flex items-center justify-center transition-all`}>
                        {block ? (
                           <div className="flex flex-col items-center gap-0.5 px-1">
                             <div className="flex items-center gap-1">
                               <MiniStarDisplay score={block.score} size={10} />
                               <span className="text-[10px] font-black text-[var(--primary-color)]">+{block.score}</span>
                             </div>
                             <span className="text-[8px] font-bold text-[var(--foreground)] opacity-70 truncate w-full text-center">{block.content}</span>
                           </div>
                        ) : (
                          <PlusCircle size={14} className="text-[var(--primary-color)]/50 group-hover:text-[var(--primary-color)] transition-colors" />
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
