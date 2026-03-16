"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Star as StarIcon } from "lucide-react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useSync } from "@/hooks/useSync";
import { useLongPressCharge } from "@/hooks/useLongPressCharge";
import ChargingOverlay from "@/components/ui/ChargingOverlay";
import { motion, AnimatePresence } from "framer-motion";

function getScoreColor(score: Score | undefined, status?: string) {
  if (status === 'planned') return 'transparent';
  if (score === undefined || score === 0) return "var(--score-empty)";
  if (score === -1) return "var(--score-punish)";
  
  // Dynamic opacity based on score for the primary color
  const opacity = score; // 0.25, 0.5, 0.75, 1
  return `rgba(var(--primary-rgb), ${opacity})`;
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLEEP_HOURS = [23, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const DAYS_SHORT = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

interface WeekGridProps {
  weekDates: string[];
}

export default function WeekGrid({ weekDates }: WeekGridProps) {
  const { blocks, saveBlock, deleteBlock, getBlock, getDayEnergy, getWeekEnergy, settings } = useTimeStore();
  const { pushBlock, deleteCloudBlock } = useSync();
  const [selectedCell, setSelectedCell] = useState<{date: string, hour: number | string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (date: string, hour: number | string) => {
    setSelectedCell({ date, hour });
    setIsModalOpen(true);
  };

  const handleDragUpdate = (date: string, oldHour: number | string, newHour: number | string) => {
    if (oldHour === newHour) return;
    const oldKey = typeof oldHour === 'number' ? `${date}-${oldHour}` : oldHour;
    const newKey = typeof newHour === 'number' ? `${date}-${newHour}` : newHour;
    
    const block = blocks[oldKey];
    if (!block) return;

    const updatedBlock: TimeBlock = { ...block, hourId: newHour, id: newKey, updatedAt: new Date().toISOString() };
    deleteBlock(date, block.id);
    saveBlock(date, updatedBlock);
    
    deleteCloudBlock(block.id);
    pushBlock(updatedBlock, date);
  };

  const handleChargeSave = (date: string, hourId: number | string, score: Score) => {
    const key = typeof hourId === 'number' ? `${date}-${hourId}` : hourId;
    const existing = blocks[key];
    
    const newBlock: TimeBlock = existing 
      ? { ...existing, score, status: 'completed', updatedAt: new Date().toISOString() }
      : {
          id: key,
          hourId: hourId,
          content: "持续专注",
          score,
          status: 'completed',
          updatedAt: new Date().toISOString()
        };
    
    saveBlock(date, newBlock);
    pushBlock(newBlock, date);
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
      <div className="flex flex-col border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center px-4 py-2 bg-[var(--primary-light)]/30">
          <div className="flex-1 flex items-center gap-4">
             <div className="flex items-center gap-2">
                <StarIcon className="text-[var(--primary-color)] animate-pulse" size={14} />
                <span className="text-[10px] font-black tracking-widest uppercase text-[var(--primary-color)]">本周能量进度 {Math.round((getWeekEnergy(weekDates) / settings.weeklyEnergyGoal) * 100)}%</span>
             </div>
             <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((getWeekEnergy(weekDates) / settings.weeklyEnergyGoal) * 100, 100)}%` }}
                  className="h-full bg-[var(--primary-color)] shadow-[0_0_8px_var(--primary-glow)]"
                />
             </div>
          </div>
          <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">目标: {settings.weeklyEnergyGoal}★</div>
        </div>

        <div className="flex">
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
                  
                  const now = new Date();
                  const isCurrentHourCell = dateStr === now.toISOString().split('T')[0] && hourIdx === now.getHours();

                  return (
                    <WeekGridCell 
                      key={hourIdx}
                      dateStr={dateStr}
                      hourIdx={hourIdx}
                      block={block}
                      isSleep={isSleep}
                      isCurrentHourCell={isCurrentHourCell}
                      onCellClick={handleCellClick}
                      onCharge={handleChargeSave}
                      onDragMove={handleDragUpdate}
                      settings={settings}
                      allVisibleHours={visibleHours}
                    />
                  );
                })}

                {/* Bonus Cell */}
                <div 
                  onClick={() => handleCellClick(dateStr, 'bonus')}
                  className="h-14 sm:h-16 relative group cursor-pointer p-[2px] sm:p-[3px] bg-[var(--primary-light)] border-t border-[var(--border-color)]"
                >
                  {(() => {
                    const block = blocks[`${dateStr}-bonus`];
                    const isPlanned = block?.status === 'planned';
                    const isCompleted = block?.status === 'completed';
                    const isPrimaryTheme = isCompleted && block.score !== 0 && block.score !== -1;
                    return (
                      <div className={`w-full h-full rounded-[14px] bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/20 border-dashed flex items-center justify-center transition-all group-hover:scale-[1.03]`}>
                        {block ? (
                           <div className="flex flex-col items-center gap-0.5 px-1">
                             {isCompleted && block.score !== 0 && (
                               <div className="flex items-center justify-center">
                                 <MiniStarDisplay score={block.score} size={11} color={isPrimaryTheme ? 'white' : undefined} />
                               </div>
                             )}
                             {(settings.showDetailsInWeekView || isPlanned) && (
                               <span className={`text-[9px] font-black truncate w-full text-center px-1
                                 ${isPlanned ? 'text-[var(--primary-color)]' : isPrimaryTheme ? 'text-white/90' : 'text-[var(--foreground)] opacity-70'}
                               `}>
                                 {block.content}
                               </span>
                             )}
                             {!settings.showDetailsInWeekView && block.score === 0 && !isPlanned && (
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-20" />
                             )}
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

function WeekGridCell({
  dateStr,
  hourIdx,
  block,
  isSleep,
  isCurrentHourCell,
  onCellClick,
  onCharge,
  onDragMove,
  settings,
  allVisibleHours
}: any) {
  const { isCharging, chargeProgress, currentChargeScore, startCharging, stopCharging } = useLongPressCharge({
    onChargeComplete: (score) => onCharge(dateStr, hourIdx, score),
  });

  const isPlanned = block?.status === 'planned';
  const isCompleted = block?.status === 'completed';
  const isPrimaryTheme = isCompleted && block.score !== 0 && block.score !== -1;

  const handleDragEnd = (event: any, info: any) => {
    if (!block) return;
    const yOffset = info.offset.y;
    const rowHeight = 64; // h-16
    const hourDiff = Math.round(yOffset / rowHeight);
    
    if (hourDiff !== 0) {
      const currentIndex = allVisibleHours.indexOf(hourIdx);
      const targetIndex = currentIndex + hourDiff;
      if (targetIndex >= 0 && targetIndex < allVisibleHours.length) {
        onDragMove(dateStr, hourIdx, allVisibleHours[targetIndex]);
      }
    }
  };

  return (
    <div 
      className={`h-14 sm:h-16 relative group p-[1px] sm:p-[2px] 
        ${isSleep ? 'sleep-hour-bg' : ''}
        ${isCurrentHourCell ? 'z-20' : ''}
      `}
    >
      <motion.div 
        layout
        drag={!!block}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={handleDragEnd}
        onPointerDown={(e: React.PointerEvent) => {
          if (e.button === 0) startCharging();
        }}
        onPointerUp={() => stopCharging()}
        onPointerLeave={() => stopCharging()}
        onClick={(e) => {
          // Prevent click if we were dragging or charging significantly
          onCellClick(dateStr, hourIdx);
        }}
        className={`w-full h-full rounded-[10px] sm:rounded-[14px] transition-all duration-300 relative overflow-hidden shadow-sm flex flex-col items-center justify-center
          ${isPlanned ? 'border-2 border-dashed border-[var(--primary-color)]/30 bg-[var(--primary-light)]' : ''}
          ${isCompleted && block.score !== 0 ? 'dark:border-white/5 active:scale-95' : 'bg-black/[0.02] dark:bg-white/[0.02]'}
          ${isCurrentHourCell ? 'ring-2 ring-inset ring-[var(--primary-color)] shadow-[0_0_10px_var(--primary-glow)]' : ''}
          ${isCharging ? 'scale-[0.98] brightness-110 shadow-lg' : ''}
        `}
        style={isCompleted ? { backgroundColor: getScoreColor(block.score, block.status) } : {}}
      >
        <AnimatePresence>
          {isCharging && (
            <ChargingOverlay 
              progress={chargeProgress} 
              score={currentChargeScore} 
              isComplete={currentChargeScore === 1} 
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {block && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-0.5 pointer-events-none select-none">
            {isCompleted && block.score !== 0 && (
              <div className="flex items-center gap-0.5 scale-[0.8] sm:scale-[0.9]">
                <MiniStarDisplay score={block.score} size={10} color={isPrimaryTheme ? 'white' : undefined} />
                {block.pomodoros && block.pomodoros > 0 && settings.showDetailsInWeekView && (
                  <span className={`text-[8px] font-bold ${isPrimaryTheme ? 'text-white' : 'text-[var(--primary-color)]'}`}>🍅x{block.pomodoros}</span>
                )}
              </div>
            )}
            
            {(settings.showDetailsInWeekView || isPlanned) && (
              <span className={`text-[8px] sm:text-[9px] font-black truncate w-full text-center leading-tight px-1
                ${isPlanned ? 'text-[var(--primary-color)]' : isPrimaryTheme ? 'text-white/90' : 'text-[var(--foreground)] opacity-60'}
              `}>
                {block.content}
              </span>
            )}
            
            {!settings.showDetailsInWeekView && block.score === 0 && !isPlanned && (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 opacity-20" />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
