"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Sparkles, Play, Pause, RotateCcw, Timer } from "lucide-react";
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

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
      setTimeLeft(25 * 60);
      setIsTimerRunning(false);
    }
  }, [isOpen, initialData]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setPomodoros(prev => Math.min(prev + 1, 2));
      const finishAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      finishAudio.play().catch(() => {});
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const now = new Date();
  const currentDayStr = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const isCurrentTimeBlock = dateStr === currentDayStr && hourIdx === currentHour;

  const timeLabel = isBonusType ? "Bonus Time (额外增益时段)" : `${hourIdx.toString().padStart(2, "0")}:00 - ${(hourIdx + 1).toString().padStart(2, "0")}:00`;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[8px] z-[60] transition-opacity duration-500"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-lg bg-[var(--modal-bg)] rounded-[44px] shadow-2xl border border-white/20 dark:border-white/5 z-[70] flex flex-col overflow-hidden animate-spring">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-7 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-5">
             <div className="p-3.5 rounded-2xl bg-[var(--primary-light)] text-[var(--primary-color)] shadow-inner">
                {isBonusType ? <Sparkles size={24} /> : <Calendar size={24} />}
             </div>
             <div>
               <h3 className="font-black text-[20px] leading-tight text-[var(--foreground)] tracking-tight">
                 {isPlanned ? '规划行动蓝图' : (isBonusType ? '记录额外增益' : '捕捉心流时刻')}
               </h3>
               <p className="text-[12px] text-gray-400 font-bold mt-1.5 tracking-widest uppercase">{timeLabel}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-[var(--hover-bg)] rounded-full transition-all text-gray-400 hover:rotate-90"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Status Toggle (Integrated Design) */}
          {!isBonusType && (
            <div className="flex rounded-[26px] bg-black/[0.04] dark:bg-white/[0.04] p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlanned(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[15px] font-black transition-all duration-500
                  ${!isPlanned ? 'bg-white dark:bg-white/10 shadow-xl text-[var(--primary-color)]' : 'text-gray-400 hover:text-gray-500'}
                `}
              >
                已完成
              </button>
              <button
                type="button"
                onClick={() => setIsPlanned(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[15px] font-black transition-all duration-500
                  ${isPlanned ? 'bg-white dark:bg-white/10 shadow-xl text-[var(--primary-color)]' : 'text-gray-400 hover:text-gray-500'}
                `}
              >
                计划中
              </button>
            </div>
          )}

          {/* 1. interactive Pomodoro Timer (Only if Current Time Block) */}
          {!isPlanned && isCurrentTimeBlock && (
            <div className="bg-[var(--primary-light)] rounded-[40px] p-7 border border-[var(--primary-color)]/10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Timer size={80} className="text-[var(--primary-color)]" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-[var(--primary-color)]">
                  <Timer size={20} className="animate-pulse" />
                  <span className="text-[12px] font-black uppercase tracking-widest">专注番茄钟</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTimeLeft(25 * 60)} className="text-[11px] bg-[var(--primary-color)]/10 px-3.5 py-1.5 rounded-full text-[var(--primary-color)] font-black hover:scale-105 transition-all">25m</button>
                  <button onClick={() => setTimeLeft(10 * 60)} className="text-[11px] bg-[var(--primary-color)]/10 px-3.5 py-1.5 rounded-full text-[var(--primary-color)] font-black hover:scale-105 transition-all">10m</button>
                </div>
              </div>
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="text-5xl font-black font-mono text-[var(--primary-color)] tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </div>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-4.5 rounded-[24px] font-black text-[15px] transition-all flex items-center justify-center gap-2 shadow-lg
                    ${isTimerRunning 
                      ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200' 
                      : 'bg-[var(--primary-color)] text-white hover:brightness-110 active:scale-95'}
                  `}
                >
                  {isTimerRunning ? <><Pause size={20} fill="currentColor" /> 暂停</> : <><Play size={20} fill="currentColor" /> 开始专注</>}
                </button>
                <button 
                  onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}
                  className="p-4 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-[22px] hover:bg-[var(--primary-color)]/20 transition-all active:scale-90"
                >
                  <RotateCcw size={22} />
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2 relative z-10">
                 <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400">本时段产出：</p>
                 <div className="flex gap-2.5">
                    {[1, 2].map(num => (
                      <button
                        key={num}
                        onClick={() => setPomodoros(num === pomodoros ? 0 : num)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm
                          ${pomodoros >= num ? 'bg-[var(--primary-color)]/20 scale-110' : 'bg-black/[0.04] dark:bg-white/5 opacity-40 grayscale'}
                        `}
                      >
                        🍅
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* 2. Energy Collection (Rating) */}
          {!isPlanned && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-black text-[var(--foreground)] opacity-90">能量收集</label>
                <div className="text-[10px] font-black px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full uppercase tracking-widest border border-[var(--primary-color)]/10">Energy Matrix</div>
              </div>
              <div className="bg-black/[0.02] dark:bg-white/[0.03] p-8 rounded-[40px] border border-[var(--border-color)] flex justify-center shadow-inner">
                <StarRating value={score} onChange={setScore} size={36} />
              </div>
            </div>
          )}

          {/* 3. Tag Selector (领域规置) */}
          <div className="flex flex-col gap-5">
            <label className="text-[15px] font-black text-[var(--foreground)] opacity-90">领域规置</label>
            <div className="grid grid-cols-4 gap-4">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                  className={`flex flex-col items-center gap-2.5 py-4 rounded-[24px] text-[13px] font-black transition-all duration-500
                    ${selectedTagId === tag.id 
                      ? 'text-white shadow-xl scale-[1.08] z-10' 
                      : 'bg-black/[0.03] dark:bg-white/[0.06] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }
                  `}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : {}}
                >
                  <span className="text-3xl drop-shadow-sm">{tag.emoji}</span>
                  <span className="truncate w-full text-center px-1 opacity-90">{tag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Content Input (心流记录与感悟) */}
          <div className="flex flex-col gap-4">
            <label className="text-[15px] font-black text-[var(--foreground)] opacity-90 tracking-tight">
              {isPlanned ? '本时段核心行动目标' : '心流记录与感悟'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isPlanned ? "例如：完成项目 UI 走查，解决对比度问题..." : "此刻的感觉如何？产出了多少价值？"}
              className="w-full h-28 p-6 text-[16px] bg-black/[0.03] dark:bg-white/[0.05] border-2 border-transparent focus:border-[var(--primary-color)]/20 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-[var(--primary-glow)] transition-all resize-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/[0.03] dark:bg-white/[0.02] border-t border-[var(--border-color)] flex items-center justify-between">
          <button 
             onClick={() => initialData && onDelete?.(initialData.id)}
             disabled={!initialData}
             className={`flex items-center gap-2.5 px-6 py-3 text-[14px] font-black transition-all rounded-[22px]
               ${initialData ? 'text-red-500 bg-red-50 dark:bg-red-950/20 hover:scale-105 active:scale-95' : 'text-gray-300 opacity-20 cursor-not-allowed'}
             `}
           >
             <Trash2 size={18} />
             <span>移除</span>
           </button>

          <div className="flex items-center gap-5">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-[15px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className={`px-12 py-4 flex items-center gap-2.5 text-[16px] font-black text-white rounded-full transition-all shadow-2xl hover:-translate-y-1.5 active:translate-y-0 active:scale-95
                ${isPlanned ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' : 'bg-[var(--primary-color)] shadow-[var(--primary-glow)]'}
              `}
            >
              <Save size={20} />
              <span>确认{isPlanned ? '计划' : '保存'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
