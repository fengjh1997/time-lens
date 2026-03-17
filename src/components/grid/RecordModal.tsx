"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Save, TimerReset, Trash2, X, Zap } from "lucide-react";
import type { Score, TimeBlock } from "@/types";
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
  if (!isOpen) return null;

  const modalKey = `${initialData?.id || `${dateStr}-${String(hourId ?? hourIdx)}`}-${initialData?.updatedAt || "new"}`;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <RecordModalContent
        key={modalKey}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        initialData={initialData}
        dateStr={dateStr}
        hourIdx={hourIdx}
        hourId={hourId}
      />
    </>
  );
}

function RecordModalContent({
  onClose,
  onSave,
  onDelete,
  initialData,
  dateStr = "",
  hourIdx = 0,
  hourId,
}: Omit<RecordModalProps, "isOpen">) {
  const { tags } = useTimeStore();
  const [content, setContent] = useState(initialData?.content || "");
  const [score, setScore] = useState<Score>(initialData?.score || 0);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(initialData?.tagId);
  const [isPlanned, setIsPlanned] = useState(initialData?.status === "planned");
  const [pomodoros, setPomodoros] = useState(initialData?.pomodoros || 0);

  const isBonusType = hourId === "bonus" || initialData?.isBonus;
  const timeLabel = useMemo(() => {
    if (isBonusType) return "额外时段";
    return `${String(hourIdx).padStart(2, "0")}:00 - ${String(hourIdx + 1).padStart(2, "0")}:00`;
  }, [hourIdx, isBonusType]);

  return (
    <div className="glass-modal fixed left-1/2 top-1/2 z-[70] flex max-h-[82vh] w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[36px]">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
            {isBonusType ? <Zap size={20} /> : <CalendarDays size={20} />}
          </div>
          <div>
            <h3 className="text-xl font-black">时间块详情</h3>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.22em] text-gray-400">{timeLabel}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-400 transition-all hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-[1fr_1.05fr]">
        <section className="space-y-6">
          {!isBonusType && (
            <div className="rounded-[24px] bg-black/[0.03] p-1 dark:bg-white/[0.04]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanned(false)}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black transition-all ${
                    !isPlanned ? "bg-white text-[var(--primary-color)] shadow-sm dark:bg-white/10" : "text-gray-400"
                  }`}
                >
                  已完成
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlanned(true)}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black transition-all ${
                    isPlanned ? "bg-white text-[var(--primary-color)] shadow-sm dark:bg-white/10" : "text-gray-400"
                  }`}
                >
                  计划中
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-black">标签</label>
              <span className="text-[12px] font-bold text-gray-400">可选，不强制</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTagId(undefined)}
                className={`rounded-[18px] border px-3 py-3 text-[12px] font-black transition-all ${
                  !selectedTagId
                    ? "border-[var(--primary-color)] bg-[var(--primary-light)] text-[var(--primary-color)]"
                    : "border-[var(--border-color)] text-gray-400"
                }`}
              >
                不设置
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`rounded-[18px] border px-3 py-3 text-left transition-all ${
                    selectedTagId === tag.id
                      ? "border-transparent text-white shadow-lg"
                      : "border-[var(--border-color)] bg-black/[0.02] text-[var(--foreground)] dark:bg-white/[0.02]"
                  }`}
                  style={selectedTagId === tag.id ? { backgroundColor: tag.color } : undefined}
                >
                  <div className="text-lg">{tag.emoji}</div>
                  <div className="mt-1 truncate text-[12px] font-black">{tag.name}</div>
                </button>
              ))}
            </div>
          </div>

          {!isPlanned && (
            <div>
              <label className="mb-3 block text-sm font-black">充能评分</label>
              <div className="rounded-[28px] border border-[var(--border-color)] bg-black/[0.02] p-5 dark:bg-white/[0.03]">
                <StarRating value={score} onChange={setScore} size={28} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-black">{isPlanned ? "计划说明" : "感悟说明"}</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder=""
              className="h-40 w-full resize-none rounded-[28px] border border-[var(--border-color)] bg-black/[0.02] px-5 py-4 text-[14px] font-medium outline-none transition-all focus:border-[var(--primary-color)]/35 dark:bg-white/[0.03]"
            />
          </div>

          {!isPlanned && (
            <div className="rounded-[28px] border border-[var(--border-color)] bg-black/[0.02] p-5 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black">番茄计数</p>
                  <p className="mt-1 text-[12px] font-medium text-gray-400">改成图标计数，不再出现奇怪占位字符。</p>
                </div>
                <Clock3 size={18} className="text-[var(--primary-color)]" />
              </div>

              <div className="mt-4 flex gap-3">
                {[0, 1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPomodoros(count)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-black transition-all ${
                      pomodoros === count
                        ? "bg-[var(--primary-color)] text-white"
                        : "bg-white text-gray-500 shadow-sm dark:bg-white/10"
                    }`}
                  >
                    <TimerReset size={15} />
                    <span>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-black/[0.02] px-6 py-5 dark:bg-white/[0.02]">
        <button
          onClick={() => initialData && onDelete?.(initialData.id)}
          disabled={!initialData}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-all ${
            initialData
              ? "bg-red-50 text-red-500 dark:bg-red-950/20"
              : "cursor-not-allowed text-gray-300 opacity-40"
          }`}
        >
          <Trash2 size={16} />
          删除
        </button>

        <button
          onClick={() => {
            const finalId =
              initialData?.id || (hourId === "bonus" ? `${dateStr}-bonus` : `${dateStr}-${hourIdx}`);
            onSave({
              id: finalId,
              dayOfWeek: initialData?.dayOfWeek ?? new Date(`${dateStr}T00:00:00`).getDay(),
              hourId: typeof hourId === "number" ? hourId : initialData?.hourId ?? hourIdx,
              score: isPlanned ? 0 : score,
              content,
              tagId: selectedTagId,
              status: isPlanned ? "planned" : "completed",
              pomodoros: isPlanned ? 0 : pomodoros,
              isBonus: isBonusType,
              updatedAt: new Date().toISOString(),
            });
            onClose();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[var(--primary-glow)]"
        >
          <Save size={16} />
          保存
        </button>
      </div>
    </div>
  );
}
