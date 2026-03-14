"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useSync } from "@/hooks/useSync";

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
  
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedCell, setSelectedCell] = useState<{date: string, hour: number | string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (date: string, hour: number | string) => {
    setSelectedCell({ date, hour });
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    if (selectedCell) {
      saveBlock(selectedCell.date, block);
      pushBlock(block, selectedCell.date);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (selectedCell) {
      deleteBlock(selectedCell.date, id);
      deleteCloudBlock(id);
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
      <div className="flex border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-10 shadow-sm">
        <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] flex items-center justify-center bg-[var(--hover-bg)]">
        </div>
        <div className="flex-1 grid grid-cols-7">
          {weekDates.map((date, idx) => {
            const dayEnergy = getDayEnergy(date);
            const dStr = date.split('-')[2];
            const isWeekend = idx >= 5;
            return (
              <Link 
                key={date} 
                href={`/day?date=${date}`}
                className={`py-3 sm:py-4 text-center border-r border-[var(--border-color)] last:border-r-0 hover:bg-[var(--primary-light)] transition-all cursor-pointer ${isWeekend ? 'bg-[var(--primary-color)]/[0.03] dark:bg-[var(--primary-color)]/[0.05]' : ''}`}
              >
                <div className="text-[10px] sm:text-[11px] font-black text-gray-400 tracking-widest uppercase">{DAYS_SHORT[idx]}</div>
                <div className="text-base sm:text-xl font-black mt-1 text-[var(--foreground)]">{dStr}</div>
                {dayEnergy !== 0 && (
                  <div className={`text-[10px] font-black mt-1 ${dayEnergy > 0 ? 'text-[var(--primary-color)]' : 'text-red-400'}`}>
                    {dayEnergy > 0 ? '+' : ''}{dayEnergy.toFixed(1)}★
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto min-h-0 relative custom-scrollbar">
        <div className="flex absolute min-w-full">
          {/* Time axis */}
          <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] bg-[var(--background)] relative z-10">
            {visibleHours.map(hour => (
              <div key={hour} className={`h-14 sm:h-16 flex items-start justify-center pt-2 relative ${SLEEP_HOURS.includes(hour) ? 'sleep-hour-bg' : ''}`}>
                <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 font-bold -translate-y-1/2 px-1 relative z-20">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
            {/* Bonus row header */}
            <div className="h-14 sm:h-16 flex items-center justify-center bg-[var(--primary-light)] border-t border-[var(--border-color)]">
              <span className="text-[9px] font-black text-[var(--primary-color)] vertical-text leading-none tracking-widest">BONUS</span>
            </div>
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 bg-[var(--border-color)] gap-[1px]">
            {weekDates.map((dateStr, dayIdx) => (
              <div key={dayIdx} className={`flex flex-col bg-[var(--background)] ${dayIdx >= 5 ? 'bg-[var(--primary-color)]/[0.015] dark:bg-[var(--primary-color)]/[0.03]' : ''}`}>
                {visibleHours.map(hourIdx => {
                  const key = `${dateStr}-${hourIdx}`;
                  const block = blocks[key];
                  const isPlanned = block?.status === 'planned';
                  const isCompleted = block?.status === 'completed';
                  const isSleep = SLEEP_HOURS.includes(hourIdx);
                  const isPrimaryTheme = isCompleted && block.score !== 0 && block.score !== -1;
                  
                  return (
                    <div 
                      key={hourIdx} 
                      onClick={() => handleCellClick(dateStr, hourIdx)}
                      className={`h-14 sm:h-16 relative group cursor-pointer p-[1px] sm:p-[2px] ${isSleep ? 'sleep-hour-bg' : ''}`}
                    >
                      <div 
                        className={`w-full h-full rounded-[10px] sm:rounded-[14px] transition-all duration-500 relative overflow-hidden shadow-sm
                          ${isPlanned ? 'border-2 border-dashed border-[var(--primary-color)]/30 bg-[var(--primary-light)]' : ''}
                        `}
                        style={isCompleted ? { backgroundColor: getScoreColor(block.score, block.status) } : {}}
                      >
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        {block && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-0.5 pointer-events-none">
                            {isCompleted && block.score !== 0 && (
                              <div className="flex items-center gap-1 scale-90 sm:scale-100">
                                <MiniStarDisplay score={block.score} size={12} color={isPrimaryTheme ? 'white' : undefined} />
                                {block.pomodoros && block.pomodoros > 0 && (
                                  <span className={`text-[10px] font-bold ${isPrimaryTheme ? 'text-white' : 'text-amber-500'}`}>🍅x{block.pomodoros}</span>
                                )}
                              </div>
                            )}
                            <span className={`text-[9px] sm:text-[10px] font-black truncate w-full text-center leading-tight px-1
                              ${isPlanned ? 'text-[var(--primary-color)]' : isPrimaryTheme ? 'text-white/90' : 'text-[var(--foreground)] opacity-60'}
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
                  className="h-14 sm:h-16 relative group cursor-pointer p-[2px] sm:p-[3px] bg-[var(--primary-light)] border-t border-[var(--border-color)]"
                >
                  {(() => {
                    const block = blocks[`${dateStr}-bonus`];
                    return (
                      <div className={`w-full h-full rounded-[14px] bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/20 border-dashed flex items-center justify-center transition-all group-hover:scale-[1.03]`}>
                        {block ? (
                           <div className="flex flex-col items-center gap-0.5 px-1">
                             <div className="flex items-center gap-1">
                               <MiniStarDisplay score={block.score} size={11} />
                               <span className="text-[11px] font-black text-[var(--primary-color)]">+{block.score}</span>
                             </div>
                             <span className="text-[9px] font-black text-[var(--foreground)] opacity-70 truncate w-full text-center px-1">{block.content}</span>
                           </div>
                        ) : (
                          <PlusCircle size={18} className="text-[var(--primary-color)]/40 group-hover:text-[var(--primary-color)] transition-all group-hover:rotate-90" />
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
