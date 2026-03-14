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
      // Reset timer when opening
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
      // Simple visual notification could go here
      alert("番茄专注完成！已自动为您添加记录。");
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

  const timeLabel = isBonusType ? "Bonus Time (额外增益时段)" : `${hourIdx.toString().padStart(2, "0")}:00 - ${(hourIdx + 1).toString().padStart(2, "0")}:00`;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[6px] z-[60] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-lg bg-[var(--modal-bg)] rounded-[40px] shadow-2xl border border-white/20 dark:border-white/5 z-[70] flex flex-col overflow-hidden animate-spring">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${isBonusType ? 'bg-amber-100/50 text-amber-600' : 'bg-[var(--primary-light)] text-[var(--primary-color)]'}`}>
                {isBonusType ? <Sparkles size={22} /> : <Calendar size={22} />}
             </div>
             <div>
               <h3 className="font-black text-[18px] leading-tight text-[var(--foreground)]">{isPlanned ? '计划任务预览' : (isBonusType ? '添加额外增益' : '记录心流块')}</h3>
               <p className="text-[12px] text-gray-400 font-bold mt-1 tracking-tight">{timeLabel}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-8 max-h-[75vh] overflow-y-auto">
          
          {/* Status Toggle */}
          {!isBonusType && (
            <div className="flex rounded-[24px] bg-black/[0.03] dark:bg-white/[0.05] p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlanned(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-[14px] font-black transition-all duration-300
                  ${!isPlanned ? 'bg-white dark:bg-white/10 shadow-lg text-[var(--primary-color)]' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                已完成
              </button>
              <button
                type="button"
                onClick={() => setIsPlanned(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-[14px] font-black transition-all duration-300
                  ${isPlanned ? 'bg-white dark:bg-white/10 shadow-lg text-[var(--primary-color)]' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                计划中
              </button>
            </div>
          )}

          {/* Interactive Pomodoro Timer (Only if not planned) */}
          {!isPlanned && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-[32px] p-6 border border-red-200/50 dark:border-red-800/20 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500">
                  <Timer size={18} />
                  <span className="text-[12px] font-black uppercase tracking-widest">专注番茄钟</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTimeLeft(25 * 60)} className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full text-red-600 font-black">25m</button>
                  <button onClick={() => setTimeLeft(10 * 60)} className="text-[10px] bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full text-red-600 font-black">10m</button>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-4xl font-black font-mono text-red-600 dark:text-red-400 tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-[14px] transition-all flex items-center justify-center gap-2
                    ${isTimerRunning 
                      ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' 
                      : 'bg-red-600 text-white shadow-xl shadow-red-500/30 hover:bg-red-700'}
                  `}
                >
                  {isTimerRunning ? <><Pause size={18} fill="currentColor" /> 暂停计时</> : <><Play size={18} fill="currentColor" /> 开始专注</>}
                </button>
                <button 
                  onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}
                  className="p-3.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl hover:bg-red-200 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                 <p className="text-[11px] font-bold text-gray-500">本小时已完成：</p>
                 <div className="flex gap-2">
                    {[1, 2].map(num => (
                      <button
                        key={num}
                        onClick={() => setPomodoros(num === pomodoros ? 0 : num)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
                          ${pomodoros >= num ? 'bg-red-100 dark:bg-red-900/40 opacity-100 grayscale-0' : 'bg-gray-100 dark:bg-white/5 opacity-30 grayscale'}
                        `}
                      >
                        🍅
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* Content Input */}
          <div className="flex flex-col gap-3">
            <label className="text-[15px] font-black text-[var(--foreground)] opacity-80">
              {isPlanned ? '准备开展什么行动？' : '这段时刻的成果'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isPlanned ? "输入行动计划..." : "简单总结您的心流状态..."}
              className="w-full h-24 p-5 text-[15px] bg-black/[0.03] dark:bg-white/[0.04] border-none rounded-[28px] focus:outline-none focus:ring-4 focus:ring-[var(--primary-glow)] transition-all resize-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          {/* Tag Selector */}
          <div className="flex flex-col gap-4">
            <label className="text-[15px] font-black text-[var(--foreground)] opacity-80">能量归类</label>
            <div className="grid grid-cols-4 gap-3">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? undefined : tag.id)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-2xl text-[12px] font-black transition-all duration-300
                    ${selectedTagId === tag.id 
                      ? 'text-white shadow-xl scale-[1.05]' 
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-gray-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]'
                    }
                  `}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : {}}
                >
                  <span className="text-2xl">{tag.emoji}</span>
                  <span className="truncate w-full text-center px-1 opacity-80">{tag.name}</span>
                </button>
              ))}
            </div>
          </div>

          {!isPlanned && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-black text-[var(--foreground)] opacity-80">心流星级等级</label>
                <div className="text-[11px] font-black px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary-color)] rounded-full uppercase tracking-tighter">Energy Level</div>
              </div>
              <div className="bg-black/[0.02] dark:bg-white/[0.03] p-6 rounded-[32px] border border-black/[0.03] dark:border-white/[0.03] flex justify-center">
                <StarRating value={score} onChange={setScore} size={32} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/[0.02] dark:bg-white/[0.01] border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
          <button 
             onClick={() => initialData && onDelete?.(initialData.id)}
             disabled={!initialData}
             className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-black transition-all rounded-[18px]
               ${initialData ? 'text-red-500 bg-red-50 dark:bg-red-950/20 hover:scale-105' : 'text-gray-300 opacity-30 cursor-not-allowed'}
             `}
           >
             <Trash2 size={16} />
             <span>彻底删除记录</span>
           </button>

          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className={`px-10 py-3.5 flex items-center gap-2 text-[15px] font-black text-white rounded-full transition-all shadow-xl hover:shadow-[var(--primary-glow)] hover:-translate-y-1 active:translate-y-0 active:scale-95
                ${isPlanned ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' : 'bg-[var(--primary-color)] shadow-[var(--primary-glow)]'}
              `}
            >
              <Save size={18} />
              <span>确认{isPlanned ? '计划任务' : '保存记录'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
