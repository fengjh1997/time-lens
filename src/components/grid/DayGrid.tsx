"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { MiniStarDisplay, EnergyDisplay } from "@/components/ui/StarRating";
import RecordModal from "./RecordModal";
import { CheckCircle, Clock, Sparkles } from "lucide-react";

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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayGridProps {
  dateStr?: string;
}

export default function DayGrid({ dateStr = "2026-03-16" }: DayGridProps) {
  const { blocks, saveBlock, deleteBlock, getBlocksForDate, getDayEnergy, tags } = useTimeStore();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dayBlocks = getBlocksForDate(dateStr);
  const dayEnergy = getDayEnergy(dateStr);
  const completedCount = dayBlocks.filter(b => b.status === 'completed').length;
  const plannedCount = dayBlocks.filter(b => b.status === 'planned').length;
  const bestBlock = dayBlocks
    .filter(b => b.status === 'completed')
    .sort((a, b) => SCORE_ENERGY[b.score] - SCORE_ENERGY[a.score])[0];

  const handleCellClick = (hour: number) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    saveBlock(dateStr, block);
  };

  const handleDeleteBlock = (id: string) => {
    const hourId = parseInt(id.split('-').pop() || "0", 10);
    deleteBlock(dateStr, hourId);
    setIsModalOpen(false);
  };

  const activeBlockKey = selectedHour !== null ? `${dateStr}-${selectedHour}` : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  const getTagForBlock = (block: TimeBlock) => tags.find(t => t.id === block.tagId);

  return (
    <div className="w-full flex justify-center h-full bg-[var(--background)] relative overflow-y-auto pb-28 sm:pb-8">
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dayIdx={1}
        hourIdx={selectedHour ?? 0}
      />

      <div className="w-full max-w-2xl px-4 sm:px-6 mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        
        {/* Day Summary Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-[20px] p-5 sm:p-6 border border-amber-200/30 dark:border-amber-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 dark:bg-amber-500/10 flex items-center justify-center">
                <Sparkles size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] sm:text-[12px] text-amber-600/70 dark:text-amber-400/70 font-bold tracking-wider">今日能量</p>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  <EnergyDisplay value={dayEnergy} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 sm:gap-4 text-center">
              <div>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle size={14} />
                  <span className="text-lg sm:text-xl font-black">{completedCount}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold">已完成</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-blue-500">
                  <Clock size={14} />
                  <span className="text-lg sm:text-xl font-black">{plannedCount}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold">待执行</p>
              </div>
            </div>
          </div>
          
          {bestBlock && (
            <div className="mt-3 pt-3 border-t border-amber-200/30 dark:border-amber-800/20">
              <p className="text-[11px] text-amber-600/60 dark:text-amber-400/60 font-bold">
                最佳时段：{bestBlock.hourId}:00 — {bestBlock.content}
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {HOURS.map(hourIdx => {
            const key = `${dateStr}-${hourIdx}`;
            const block = blocks[key];
            const isSelected = selectedHour === hourIdx;
            const hasContent = block && (block.score !== 0 || block.status === 'planned');
            const isPlanned = block?.status === 'planned';
            const isCompleted = block?.status === 'completed';
            const tag = block ? getTagForBlock(block) : null;
            
            return (
              <div 
                key={hourIdx}
                onClick={() => handleCellClick(hourIdx)}
                className="group flex gap-3 sm:gap-4 cursor-pointer items-stretch"
              >
                {/* Time Axis */}
                <div className="w-12 sm:w-14 shrink-0 flex justify-end items-start text-[12px] sm:text-[13px] font-bold font-mono text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors pt-3.5">
                  {hourIdx.toString().padStart(2, '0')}:00
                </div>

                {/* Block */}
                <div 
                  className={`flex-1 min-h-[4rem] sm:min-h-[4.5rem] rounded-[16px] sm:rounded-[20px] p-3.5 sm:p-4 transition-all duration-300 ease-out
                    ${isPlanned 
                      ? 'border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-[1.01]' 
                      : isCompleted && block.score !== 0
                        ? 'shadow-sm hover:shadow-md hover:scale-[1.01] border border-white/30 dark:border-white/5'
                        : 'bg-black/[0.015] dark:bg-white/[0.015] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:scale-[1.005]'
                    }
                    ${isSelected ? 'ring-2 ring-offset-2 ring-amber-400 dark:ring-offset-[#111] scale-[1.02] shadow-lg' : ''}
                  `}
                  style={isCompleted && block.score !== 0 ? { 
                    backgroundColor: getScoreColor(block.score),
                    color: block.score === -1 || block.score >= 0.75 ? 'white' : 'var(--foreground)'
                  } : {}}
                >
                  <div className="flex items-center justify-between h-full gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                      {/* Tag emoji */}
                      {tag && (
                        <span className="text-base sm:text-lg shrink-0">{tag.emoji}</span>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {hasContent ? (
                          <span className={`text-[13px] sm:text-[14px] font-bold leading-snug block truncate
                            ${isPlanned ? 'text-blue-600 dark:text-blue-400' : ''}
                          `}>
                            {isPlanned && '📋 '}{block.content}
                          </span>
                        ) : (
                          <span className="text-[13px] sm:text-[14px] font-medium text-black/15 dark:text-white/10 group-hover:text-black/30 dark:group-hover:text-white/20 transition-colors">
                            空闲时段
                          </span>
                        )}
                        {tag && hasContent && (
                          <span className="text-[10px] sm:text-[11px] font-semibold opacity-50 mt-0.5 block">{tag.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Star display */}
                    {isCompleted && block.score !== 0 && (
                      <div className="shrink-0 flex items-center gap-1.5 bg-black/10 dark:bg-white/15 px-2 py-1 rounded-full backdrop-blur-sm">
                        <MiniStarDisplay score={block.score} size={14} />
                        <span className="text-[11px] font-black">{block.score}</span>
                      </div>
                    )}
                    
                    {isPlanned && (
                      <span className="shrink-0 text-[10px] sm:text-[11px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                        待执行
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
