"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar } from "lucide-react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import StarRating from "@/components/ui/StarRating";

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onDelete?: (id: string) => void;
  initialData?: TimeBlock | null;
  dayIdx?: number;
  hourIdx?: number;
}

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  dayIdx = 0,
  hourIdx = 0,
}: RecordModalProps) {
  const { tags } = useTimeStore();
  const [content, setContent] = useState("");
  const [score, setScore] = useState<Score>(0);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [isPlanned, setIsPlanned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContent(initialData.content);
        setScore(initialData.score);
        setSelectedTagId(initialData.tagId);
        setIsPlanned(initialData.status === 'planned');
      } else {
        setContent("");
        setScore(0);
        setSelectedTagId(undefined);
        setIsPlanned(false);
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
      score: isPlanned ? 0 : score,
      content,
      tagId: selectedTagId,
      status: isPlanned ? 'planned' : 'completed',
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
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md bg-[var(--modal-bg)] rounded-[24px] shadow-2xl border border-white/20 dark:border-[#333]/50 z-50 flex flex-col overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]/50 dark:border-[#333]/50">
          <div>
            <h3 className="font-bold text-lg tracking-tight">{isPlanned ? '安排计划' : '记录时段'}</h3>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">{timeLabel}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[65vh] overflow-y-auto">
          
          {/* Mode Toggle: Plan vs Record */}
          <div className="flex rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] p-1 gap-1">
            <button
              type="button"
              onClick={() => setIsPlanned(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300
                ${!isPlanned ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={!isPlanned ? "#f59e0b" : "none"} stroke={!isPlanned ? "#f59e0b" : "currentColor"} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              已完成
            </button>
            <button
              type="button"
              onClick={() => setIsPlanned(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-300
                ${isPlanned ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <Calendar size={16} className={isPlanned ? 'text-blue-500' : ''} />
              计划中
            </button>
          </div>

          {/* Tag Selector */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[14px] font-bold text-gray-700 dark:text-gray-300">活动标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
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
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-700 dark:text-gray-300">
              {isPlanned ? '计划做什么？' : '这个时段你在做什么？'}
            </label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isPlanned ? "例如：深度工作两小时产出设计稿..." : "例如：阅读 Next.js 官方文档..."}
              className="w-full h-20 p-4 text-[14px] bg-black/[0.03] dark:bg-white/[0.03] border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all resize-none font-medium placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          {/* Star Rating (only for completed) */}
          {!isPlanned && (
            <div className="flex flex-col gap-2.5">
              <label className="text-[14px] font-bold text-gray-700 dark:text-gray-300">专注能量值</label>
              <StarRating value={score} onChange={setScore} size={28} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[#e5e5e5]/30 dark:border-[#333]/30 flex items-center justify-between">
          {initialData && initialData.score !== 0 ? (
             <button 
               onClick={() => onDelete?.(initialData.id)}
               className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
             >
               <Trash2 size={15} />
               <span>清空</span>
             </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-[14px] font-bold hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className={`px-6 py-2.5 flex items-center gap-2 text-[14px] font-bold text-white rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                ${isPlanned ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'}
              `}
            >
              <Save size={15} />
              <span>{isPlanned ? '保存计划' : '保存记录'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
