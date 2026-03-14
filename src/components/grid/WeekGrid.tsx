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
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
// Map dayIdx to actual date strings for our mock week
const DAY_DATES = [
  "2026-03-16", "2026-03-17", "2026-03-18",
  "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"
];

export default function WeekGrid() {
  const { blocks, saveBlock, deleteBlock } = useTimeStore();

  const [selectedCell, setSelectedCell] = useState<{day: number, hour: number} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCellClick = (day: number, hour: number) => {
    setSelectedCell({ day, hour });
    setIsModalOpen(true);
  };

  const handleSaveBlock = (block: TimeBlock) => {
    if (selectedCell) {
      const dateStr = DAY_DATES[selectedCell.day];
      saveBlock(dateStr, block);
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (selectedCell) {
      const dateStr = DAY_DATES[selectedCell.day];
      const hourId = parseInt(id.split('-').pop() || "0", 10);
      deleteBlock(dateStr, hourId);
      setIsModalOpen(false);
    }
  };

  // Get active block for modal if editing
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

      {/* Header / Days */}
      <div className="flex border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-10 shadow-sm">
        <div className="w-16 shrink-0 border-r border-[#e5e5e5] dark:border-[#333333] flex items-center justify-center bg-[var(--hover-bg)]">
          <span className="text-[10px] text-gray-400 font-bold tracking-wider">GMT+8</span>
        </div>
        <div className="flex-1 grid grid-cols-7">
          {DAYS.map((day, idx) => (
             <div key={day} className={`py-3 text-center border-r border-[#e5e5e5] dark:border-[#333333] last:border-r-0 ${idx === 5 || idx === 6 ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''}`}>
               <div className="text-[11px] font-bold text-gray-400 tracking-widest">{day}</div>
               <div className="text-lg font-black mt-0.5 text-[var(--foreground)]">
                 {16 + idx}
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="flex absolute min-w-full">
          {/* Time axis */}
          <div className="w-16 shrink-0 border-r border-[#e5e5e5] dark:border-[#333333] bg-[var(--background)] relative z-10">
            {HOURS.map(hour => (
              <div key={hour} className="h-16 flex items-start justify-center pt-2 relative border-b border-transparent">
                <span className="text-[11px] font-mono text-gray-400 -translate-y-1/2 bg-[var(--background)] px-1 relative z-20">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 bg-[var(--border-color)] gap-[1px]">
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className={`flex flex-col bg-[var(--background)] ${dayIdx === 5 || dayIdx === 6 ? 'bg-gray-50/50 dark:bg-[#1a1a1a]' : ''}`}>
                {HOURS.map(hourIdx => {
                  const key = `${DAY_DATES[dayIdx]}-${hourIdx}`;
                  const block = blocks[key];
                  const isSelected = selectedCell?.day === dayIdx && selectedCell?.hour === hourIdx;
                  
                  return (
                     <div 
                      key={hourIdx} 
                      onClick={() => handleCellClick(dayIdx, hourIdx)}
                      className="h-16 relative group cursor-pointer transition-colors hover:z-10 p-[2px]"
                    >
                      <div 
                        className="w-full h-full rounded-[10px] transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          backgroundColor: getScoreColor(block?.score),
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                          transform: isSelected ? 'scale(1.05)' : 'none'
                        }}
                      >
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        {block && block.score !== 0 && (
                          <div className="absolute inset-x-1 top-1 bottom-1 flex items-center justify-center overflow-hidden">
                            <span className="text-[10px] font-bold text-black/60 dark:text-white/80 truncate px-1">
                              {block.content}
                            </span>
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
