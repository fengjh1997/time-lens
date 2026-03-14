"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore, DEFAULT_TAGS } from "@/store/timeStore";

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onDelete?: (id: string) => void;
  initialData?: TimeBlock | null;
  dayIdx?: number;
  hourIdx?: number;
}

const SCORE_LABELS: Record<Score, string> = {
  "-1": "荒废与内耗 (-10 pts)",
  "0": "空闲时段",
  "1": "轻度维持 (+10 pts)",
  "2": "常规输出 (+20 pts)",
  "3": "高效专注 (+30 pts)",
  "4": "心流状态 (+40 pts)",
};

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  dayIdx = 0,
  hourIdx = 0,
}: RecordModalProps) {
  const [content, setContent] = useState("");
  const [score, setScore] = useState<Score>(0);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContent(initialData.content);
        setScore(initialData.score);
        setSelectedTagId(initialData.tagId);
      } else {
        setContent("");
        setScore(0);
        setSelectedTagId(undefined);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    const id = initialData?.id || `${dayIdx}-${hourIdx}`;
    onSave({
      id,
      dayOfWeek: initialData?.dayOfWeek ?? dayIdx,
      hourId: initialData?.hourId ?? hourIdx,
      score,
      content,
      tagId: selectedTagId,
    });
    onClose();
  };

  const timeLabel = `${hourIdx.toString().padStart(2, "0")}:00 - ${(hourIdx + 1).toString().padStart(2, "0")}:00`;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--modal-bg)] rounded-[24px] shadow-2xl border border-white/20 dark:border-[#333]/50 z-50 flex flex-col pt-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-[#e5e5e5]/50 dark:border-[#333]/50">
          <div>
            <h3 className="font-bold text-xl tracking-tight">记录时段</h3>
            <p className="text-[13px] text-gray-500 font-medium tracking-wide mt-1">{timeLabel}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-[var(--foreground)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          {/* Tag Selector */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[15px] font-bold text-gray-700 dark:text-gray-300">
              活动标签
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold transition-all duration-200
                    ${selectedTagId === tag.id 
                      ? 'text-white shadow-md scale-105' 
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:scale-[1.03]'
                    }
                  `}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : {}}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[15px] font-bold text-gray-700 dark:text-gray-300">
              这个时段你在做什么？
            </label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例如：阅读 Next.js 官方文档，并完成首页重构..."
              className="w-full h-24 p-4 text-[15px] bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#33a333]/50 transition-all resize-none shadow-inner font-medium placeholder:font-normal"
            />
          </div>

          {/* Score Selector */}
          <div className="flex flex-col gap-3.5">
            <label className="text-[15px] font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>专注能量值</span>
              <span className="text-xs font-semibold text-gray-500 transition-colors duration-300 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">{SCORE_LABELS[score]}</span>
            </label>
            
            <div className="grid grid-cols-6 gap-2 h-14">
              {[ -1, 0, 1, 2, 3, 4 ].map((s) => {
                const sTyped = s as Score;
                const isSelected = score === sTyped;
                
                let bgClass = "bg-[var(--score-empty)]";
                if (s === -1) bgClass = "bg-[var(--score-punish)] text-white";
                if (s === 1) bgClass = "bg-[var(--score-1)]";
                if (s === 2) bgClass = "bg-[var(--score-2)] text-white dark:text-[#cce8cc]";
                if (s === 3) bgClass = "bg-[var(--score-3)] text-white";
                if (s === 4) bgClass = "bg-[var(--score-4)] text-white";

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScore(sTyped)}
                    className={`
                      ${bgClass} 
                      rounded-xl font-mono font-bold text-base transition-all duration-300 ease-out
                      flex items-center justify-center
                      ${isSelected ? 'ring-2 ring-offset-2 ring-[#33a333] dark:ring-offset-[#202020] scale-[1.12] shadow-lg z-10' : 'opacity-70 hover:opacity-100 hover:scale-[1.05] border border-black/5 dark:border-white/5'}
                    `}
                  >
                    {s === 0 ? "-" : s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[#e5e5e5]/50 dark:border-[#333]/50 flex items-center justify-between">
          {initialData && initialData.score !== 0 ? (
             <button 
               onClick={() => onDelete?.(initialData.id)}
               className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
             >
               <Trash2 size={16} />
               <span>清空</span>
             </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-[15px] font-bold hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 flex items-center gap-2 text-[15px] font-bold bg-[#33a333] hover:bg-[#2e922e] text-white rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <Save size={16} />
              <span>保存记录</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
