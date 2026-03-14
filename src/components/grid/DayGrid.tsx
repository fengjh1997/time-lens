"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { MiniStarDisplay, EnergyDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import { CheckCircle, Clock, Sparkles, Plus } from "lucide-react";

function getScoreColor(score?: Score) {
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

interface DayGridProps {
  dateStr?: string;
}

export default function DayGrid({ dateStr = "2026-03-16" }: DayGridProps) {
  const { blocks, saveBlock, deleteBlock, getBlocksForDate, getDayEnergy, tags, settings } = useTimeStore();
  const [selectedHour, setSelectedHour] = useState<number | string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dayBlocks = getBlocksForDate(dateStr);
  const dayEnergy = getDayEnergy(dateStr);
  const completedCount = dayBlocks.filter(b => b.status === 'completed' && !b.isBonus).length;
  const plannedCount = dayBlocks.filter(b => b.status === 'planned').length;
  const bonusBlocks = dayBlocks.filter(b => b.isBonus);
  const bonusEnergy = bonusBlocks.reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);

  const bestBlock = dayBlocks
    .filter(b => b.status === 'completed')
    .sort((a, b) => SCORE_ENERGY[b.score] - SCORE_ENERGY[a.score])[0];

  const handleCellClick = (hour: number | string) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    saveBlock(dateStr, block);
  };

  const handleDeleteBlock = (id: string) => {
    deleteBlock(dateStr, id);
    setIsModalOpen(false);
  };

  const activeBlockKey = selectedHour !== null ? (typeof selectedHour === 'number' ? `${dateStr}-${selectedHour}` : `${dateStr}-bonus`) : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  const getTagForBlock = (block: TimeBlock) => tags.find(t => t.id === block.tagId);

  const visibleHours = settings.hideSleepTime 
    ? ALL_HOURS.filter(h => !SLEEP_HOURS.includes(h))
    : ALL_HOURS;

  return (
    <div className="w-full flex justify-center h-full bg-[var(--background)] relative overflow-y-auto pb-32 sm:pb-12">
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dateStr={dateStr}
        hourIdx={typeof selectedHour === 'number' ? selectedHour : 0}
        hourId={selectedHour ?? undefined}
      />

      <div className="w-full max-w-2xl px-4 sm:px-6 mt-4 sm:mt-6 space-y-6 sm:space-y-8">
        
        {/* Day Summary Card */}
        <div className="bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-light)]/50 rounded-[32px] p-6 sm:p-8 border border-[var(--primary-color)]/20 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary-color)]/10 blur-3xl rounded-full" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] bg-[var(--primary-color)]/10 flex items-center justify-center shadow-inner">
                <Sparkles size={28} className="text-[var(--primary-color)]" />
              </div>
              <div>
                <p className="text-[12px] sm:text-[13px] text-[var(--primary-color)]/70 font-black tracking-widest uppercase">今日能量汇聚</p>
                <div className="text-3xl sm:text-4xl font-black text-[var(--primary-color)] mt-0.5 tabular-nums">
                  <EnergyDisplay value={dayEnergy} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 sm:gap-6 text-center">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                  <CheckCircle size={18} strokeWidth={2.5} />
                  <span className="text-xl sm:text-2xl font-black tabular-nums">{completedCount}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1">已完成</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[var(--primary-color)] opacity-70">
                  <Clock size={18} strokeWidth={2.5} />
                  <span className="text-xl sm:text-2xl font-black tabular-nums">{plannedCount}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1">待执行</p>
              </div>
            </div>
          </div>
          
          {bestBlock && (
            <div className="mt-5 pt-5 border-t border-[var(--primary-color)]/10 flex items-center justify-between">
              <p className="text-[12px] text-[var(--primary-color)]/60 font-bold">
                最佳产出：{bestBlock.hourId}:00 · {getTagForBlock(bestBlock)?.name}
              </p>
              {bonusEnergy > 0 && (
                <span className="text-[11px] font-black bg-[var(--primary-color)]/10 px-2.5 py-0.5 rounded-full text-[var(--primary-color)]">
                  Bonus: +{bonusEnergy.toFixed(1)}★
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeline Header */}
        <div className="flex items-center justify-between px-2">
           <h2 className="text-[14px] font-black text-gray-400 tracking-widest uppercase">时间轴线</h2>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3">
          {visibleHours.map(hourIdx => {
            const key = `${dateStr}-${hourIdx}`;
            const block = blocks[key];
            const isSelected = selectedHour === hourIdx;
            const hasContent = block && (block.score !== 0 || block.status === 'planned');
            const isPlanned = block?.status === 'planned';
            const isCompleted = block?.status === 'completed';
            const tag = block ? getTagForBlock(block) : null;
            const isSleep = SLEEP_HOURS.includes(hourIdx);
            
            return (
              <div 
                key={hourIdx}
                onClick={() => handleCellClick(hourIdx)}
                className={`group flex gap-4 sm:gap-6 cursor-pointer items-stretch ${isSleep ? 'opacity-60' : ''}`}
              >
                <div className={`w-14 shrink-0 flex justify-end items-start text-[14px] font-black font-mono text-gray-200 dark:text-gray-800 group-hover:text-gray-400 dark:group-hover:text-gray-600 transition-colors pt-4 ${isSleep ? 'text-gray-100 dark:text-gray-900' : ''}`}>
                  {hourIdx.toString().padStart(2, '0')}:00
                </div>

                <div 
                  className={`flex-1 min-h-[4.5rem] rounded-[24px] p-4 sm:p-5 transition-all duration-300 ease-out flex items-center
                    ${isPlanned 
                      ? 'border-2 border-dashed border-[var(--primary-color)] opacity-60 bg-[var(--primary-light)] hover:scale-[1.01]' 
                      : isCompleted && block.score !== 0
                        ? 'shadow-sm hover:shadow-md hover:scale-[1.01] border border-white/20 dark:border-white/5'
                        : isSleep 
                          ? 'sleep-hour-bg border border-transparent'
                          : 'bg-black/[0.015] dark:bg-white/[0.015] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:scale-[1.005]'
                    }
                    ${isSelected ? 'ring-2 ring-offset-2 ring-[var(--primary-color)] dark:ring-offset-[#111] scale-[1.02] shadow-xl' : ''}
                  `}
                  style={isCompleted && block.score !== 0 ? { 
                    backgroundColor: getScoreColor(block.score),
                    color: block.score === -1 || block.score >= 0.75 ? 'white' : 'var(--foreground)'
                  } : {}}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {tag && (
                        <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
                          <span className="text-xl">{tag.emoji}</span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {hasContent ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[15px] font-black leading-tight block truncate
                              ${isPlanned ? 'text-[var(--primary-color)]' : ''}
                            `}>
                              {block.content}
                            </span>
                            {tag && <span className="text-[11px] font-bold opacity-60 tracking-wider uppercase">{tag.name}</span>}
                          </div>
                        ) : (
                          <span className={`text-[14px] font-bold text-gray-200 dark:text-gray-800 group-hover:text-gray-300 dark:group-hover:text-gray-700 transition-colors tracking-widest uppercase ${isSleep ? 'text-gray-100 dark:text-gray-900' : ''}`}>
                            空闲真空时段
                          </span>
                        )}
                      </div>
                    </div>

                    {isCompleted && block.score !== 0 && (
                      <div className="shrink-0 flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                        {block.pomodoros && block.pomodoros > 0 && (
                           <div className="flex gap-0.5 border-r border-black/10 dark:border-white/10 pr-2 mr-0.5">
                             {Array(block.pomodoros).fill(0).map((_, i) => <span key={i}>🍅</span>)}
                           </div>
                        )}
                        <MiniStarDisplay score={block.score} size={16} />
                        <span className="text-[13px] font-black tabular-nums">{block.score}</span>
                      </div>
                    )}
                    
                    {isPlanned && (
                      <span className="shrink-0 text-[11px] font-black text-[var(--primary-color)] bg-[var(--primary-light)] px-3 py-1 rounded-full uppercase tracking-widest">
                        待执行
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bonus Time Section */}
          <div className="mt-8 border-t border-dashed border-[var(--primary-color)]/20 pt-6">
             <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-[13px] font-black text-[var(--primary-color)] tracking-widest uppercase flex items-center gap-2">
                 <Sparkles size={16} />
                 Bonus Time 额外增益
               </h3>
               {!blocks[`${dateStr}-bonus`] && (
                 <button 
                   onClick={() => handleCellClick('bonus')}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] text-[11px] font-bold hover:scale-105 transition-all"
                 >
                   <Plus size={14} />
                   添加块
                 </button>
               )}
             </div>

             {blocks[`${dateStr}-bonus`] ? (
               <div 
                 onClick={() => handleCellClick('bonus')}
                 className="flex-1 rounded-[32px] p-6 shadow-lg border border-[var(--primary-color)]/20 bg-[var(--primary-light)]/50 cursor-pointer hover:scale-[1.01] transition-all"
               >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-[var(--primary-color)]/10 flex items-center justify-center text-2xl">
                       {getTagForBlock(blocks[`${dateStr}-bonus`])?.emoji || '✨'}
                     </div>
                     <div>
                       <span className="text-[17px] font-black text-[var(--foreground)] block">{blocks[`${dateStr}-bonus`].content}</span>
                       <span className="text-[11px] font-bold text-[var(--primary-color)] uppercase tracking-widest">额外增益时段</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-full shadow-md">
                     <MiniStarDisplay score={blocks[`${dateStr}-bonus`].score} size={16} />
                     <span className="text-sm font-black">+{blocks[`${dateStr}-bonus`].score}★</span>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="h-20 rounded-[24px] border-2 border-dashed border-[var(--primary-color)]/10 flex items-center justify-center text-gray-300 dark:text-gray-700 font-bold text-[11px] tracking-widest uppercase">
                 今天还没有额外增益
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
