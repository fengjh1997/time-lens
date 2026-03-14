"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Star, Sparkles } from "lucide-react";
import { type Score, type TimeBlock } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import StarRating from "@/components/ui/StarRating";

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
  onDelete?: (id: string) => void;
  initialData?: TimeBlock | null;
  dateStr?: string;
  hourIdx?: number;
  hourId?: number | string;
}

export default function RecordModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  dateStr = "",
  hourIdx = 0,
  hourId,
}: RecordModalProps) {
  const { tags } = useTimeStore();
  const [content, setContent] = useState("");
  const [score, setScore] = useState<Score>(0);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  const [isPlanned, setIsPlanned] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);

  const isBonusType = hourId === 'bonus' || initialData?.isBonus;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContent(initialData.content);
        setScore(initialData.score);
        setSelectedTagId(initialData.tagId);
        setIsPlanned(initialData.status === 'planned');
        setPomodoros(initialData.pomodoros || 0);
      } else {
        setContent("");
        setScore(0);
        setSelectedTagId(undefined);
        setIsPlanned(false);
        setPomodoros(0);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalId = initialData?.id || (hourId === 'bonus' ? `${dateStr}-bonus` : `${dateStr}-${hourIdx}`);
    onSave({
      id: finalId,
      dayOfWeek: initialData?.dayOfWeek ?? new Date(dateStr).getDay(),
      hourId: typeof hourId === 'number' ? hourId : (initialData?.hourId ?? hourIdx),
      score: isPlanned ? 0 : score,
      content,
      tagId: selectedTagId,
      status: isPlanned ? 'planned' : 'completed',
      pomodoros: isPlanned ? 0 : pomodoros,
      isBonus: isBonusType,
    });
    onClose();
  };

  const timeLabel = isBonusType ? "Bonus Time (额外增益时段)" : `${hourIdx.toString().padStart(2, "0")}:00 - ${(hourIdx + 1).toString().padStart(2, "0")}:00`;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[4px] z-[60] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md bg-[var(--modal-bg)] rounded-[32px] shadow-2xl border border-white/20 dark:border-white/5 z-[70] flex flex-col overflow-hidden animate-spring">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-2xl ${isBonusType ? 'bg-amber-100/50 text-amber-600' : 'bg-black/[0.03] dark:bg-white/5'}`}>
                {isBonusType ? <Sparkles size={20} /> : <Calendar size={20} />}
             </div>
             <div>
               <h3 className="font-bold text-lg leading-tight">{isPlanned ? '计划任务' : (isBonusType ? '添加额外增益' : '记录心流')}</h3>
               <p className="text-[12px] text-gray-500 font-bold mt-0.5 tracking-tight">{timeLabel}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          
          {/* Status Toggle (only for regular hours) */}
          {!isBonusType && (
            <div className="flex rounded-[20px] bg-black/[0.03] dark:bg-white/[0.05] p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setIsPlanned(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[15px] text-[14px] font-black transition-all duration-300
                  ${!isPlanned ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                已完成
              </button>
              <button
                type="button"
                onClick={() => setIsPlanned(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[15px] text-[14px] font-black transition-all duration-300
                  ${isPlanned ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                计划中
              </button>
            </div>
          )}

          {/* Content Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-black text-gray-800 dark:text-gray-200">
              {isPlanned ? '准备做什么？' : '记录内容'}
            </label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isPlanned ? "输入你的计划内容..." : "用一句话总结这段时间..."}
              className="w-full h-24 p-4 text-[15px] bg-black/[0.03] dark:bg-white/[0.04] border-none rounded-[20px] focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all resize-none font-bold placeholder:font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          {/* Tag Selector */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-black text-gray-800 dark:text-gray-200">所属分类</label>
            <div className="grid grid-cols-4 gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-black transition-all duration-200
                    ${selectedTagId === tag.id 
                      ? 'text-white shadow-lg scale-105' 
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-gray-400 hover:scale-[1.03] hover:text-gray-600'
                    }
                  `}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : {}}
                >
                  <span className="text-xl">{tag.emoji}</span>
                  <span className="truncate w-full text-center px-1">{tag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {!isPlanned && (
            <>
              {/* Pomodoro Selector */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-black text-gray-800 dark:text-gray-200">番茄钟 (内嵌 25min x 2)</label>
                <div className="flex gap-3">
                  {[0, 1, 2].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPomodoros(num)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-black transition-all
                        ${pomodoros === num 
                          ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-400 dark:bg-amber-950/30' 
                          : 'bg-black/[0.03] dark:bg-white/[0.05] text-gray-400'}
                      `}
                    >
                      {num === 0 ? '无' : Array(num).fill('🍅').join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-black text-gray-800 dark:text-gray-200">心流能量等级</label>
                <StarRating value={score} onChange={setScore} size={28} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/[0.01] dark:bg-white/[0.01] border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
          <button 
             onClick={() => initialData && onDelete?.(initialData.id)}
             disabled={!initialData}
             className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-black transition-colors rounded-full
               ${initialData ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' : 'text-gray-300 opacity-50 cursor-not-allowed'}
             `}
           >
             <Trash2 size={16} />
             <span>清除</span>
           </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-[14px] font-bold text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className={`px-8 py-2.5 flex items-center gap-2 text-[14px] font-black text-white rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                ${isPlanned ? 'bg-blue-500 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-600'}
              `}
            >
              <Save size={16} />
              <span>保存{isPlanned ? '计划' : '记录'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
