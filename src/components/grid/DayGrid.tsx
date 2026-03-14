"use client";

import { useState } from "react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import RecordModal from "./RecordModal";

// Helper to get color variable based on score
function getScoreColor(score?: Score) {
  if (score === undefined) return "var(--score-empty)";
  switch (score) {
    case -1: return "var(--score-punish)";
    case 0: return "var(--score-empty)";
    case 1: return "var(--score-1)";
    case 2: return "var(--score-2)";
    case 3: return "var(--score-3)";
    case 4: return "var(--score-4)";
    default: return "var(--score-empty)";
  }
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MOCK_DATE_PREFIX = "2026-03-16"; // Simplification for mvp

export default function DayGrid() {
  const { blocks, saveBlock, deleteBlock } = useTimeStore();

  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Assuming current day is Monday (dayIdx 1) for MVP
  const currentDayIdx = 1;

  const handleCellClick = (hour: number) => {
    setSelectedHour(hour);
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    saveBlock(MOCK_DATE_PREFIX, block);
  };

  const handleDeleteBlock = (id: string) => {
    const hourId = parseInt(id.split('-').pop() || "0", 10);
    deleteBlock(MOCK_DATE_PREFIX, hourId);
    setIsModalOpen(false);
  };

  const activeBlockKey = selectedHour !== null ? `${MOCK_DATE_PREFIX}-${selectedHour}` : null;
  const activeBlock = activeBlockKey ? blocks[activeBlockKey] : null;

  return (
    <div className="w-full flex justify-center h-full bg-[var(--background)] relative overflow-y-auto pb-24">
      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
        initialData={activeBlock}
        dayIdx={currentDayIdx}
        hourIdx={selectedHour ?? 0}
      />

      <div className="w-full max-w-2xl px-6 mt-8">
        <div className="flex flex-col gap-3">
          {HOURS.map(hourIdx => {
            const key = `${MOCK_DATE_PREFIX}-${hourIdx}`;
            const block = blocks[key];
            const isSelected = selectedHour === hourIdx;
            const hasContent = block && block.score !== 0;
            
            return (
              <div 
                key={hourIdx}
                onClick={() => handleCellClick(hourIdx)}
                className="group flex gap-5 cursor-pointer items-stretch"
              >
                {/* Time Axis */}
                <div className="w-14 shrink-0 flex justify-end items-start text-[13px] font-bold font-mono text-gray-400 group-hover:text-[var(--foreground)] transition-colors pt-4 opacity-60 group-hover:opacity-100">
                  {hourIdx.toString().padStart(2, '0')}:00
                </div>

                {/* Day Block */}
                <div 
                  className={`flex-1 min-h-[5rem] rounded-[20px] p-4 transition-all duration-300 ease-out border border-white/40 dark:border-white/5
                     ${isSelected ? 'ring-2 ring-offset-2 ring-[#33a333] dark:ring-offset-[#111] scale-[1.02] shadow-lg' : 'hover:scale-[1.015] shadow-sm hover:shadow-md'}
                  `}
                  style={{ 
                    backgroundColor: getScoreColor(block?.score),
                    color: block?.score === -1 || (block?.score && block.score >= 3) ? 'white' : 'var(--foreground)'
                  }}
                >
                  <div className="flex items-start justify-between h-full">
                    {hasContent ? (
                       <span className="text-[15px] font-bold leading-relaxed tracking-wide">
                         {block.content}
                       </span>
                    ) : (
                      <span className="text-[15px] font-medium text-black/30 dark:text-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        空白时段...
                      </span>
                    )}

                    {hasContent && (
                      <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-black/10 dark:bg-white/20 text-xs font-black font-mono shadow-inner backdrop-blur-sm">
                        {block.score}
                      </div>
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
