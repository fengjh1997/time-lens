"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Save, Trash2, X, Zap } from "lucide-react";
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
      <div className="sheet-backdrop" onClick={onClose} />
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

  const isBonusType = hourId === "bonus" || initialData?.isBonus;
  const timeLabel = useMemo(() => {
    if (isBonusType) return "额外时段";
    return `${String(hourIdx).padStart(2, "0")}:00 - ${String(hourIdx + 1).padStart(2, "0")}:00`;
  }, [hourIdx, isBonusType]);

  return (
    <div className="glass-modal fixed left-1/2 top-1/2 z-[70] flex max-h-[86vh] w-[calc(100%-20px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[34px] no-select">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
            {isBonusType ? <Zap size={18} /> : <CalendarDays size={18} />}
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">Block Detail</p>
            <h3 className="mt-1 text-lg font-black">{timeLabel}</h3>
          </div>
        </div>

        <button type="button" onClick={onClose} className="rounded-full bg-black/[0.04] p-2 text-subtle dark:bg-white/[0.06]">
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_1.05fr]">
        <section className="space-y-5">
          {!isBonusType && (
            <div className="glass-card rounded-[24px] p-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanned(false)}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black ${
                    !isPlanned ? "bg-white/85 text-[var(--primary-color)] dark:bg-white/[0.08]" : "text-faint"
                  }`}
                >
                  已完成
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlanned(true)}
                  className={`rounded-[18px] px-4 py-3 text-sm font-black ${
                    isPlanned ? "bg-white/85 text-[var(--primary-color)] dark:bg-white/[0.08]" : "text-faint"
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
              <span className="text-[12px] font-bold text-faint">可选，不强制</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTagId(undefined)}
                className={`rounded-[18px] border px-3 py-3 text-[12px] font-black ${
                  !selectedTagId
                    ? "border-[var(--primary-color)] bg-[var(--primary-light)] text-[var(--primary-color)]"
                    : "border-[var(--border-color)] text-faint"
                }`}
              >
                不设置
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`rounded-[18px] border px-3 py-3 text-left ${
                    selectedTagId === tag.id
                      ? "border-transparent text-white shadow-lg"
                      : "border-[var(--border-color)] bg-black/[0.02] text-[var(--foreground)] dark:bg-white/[0.03]"
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
              <div className="glass-card rounded-[28px] p-5">
                <StarRating value={score} onChange={setScore} size={28} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div>
            <label className="mb-3 block text-sm font-black">{isPlanned ? "计划说明" : "感悟说明"}</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder=""
              className="glass-card h-40 w-full resize-none rounded-[28px] px-5 py-4 text-[14px] font-medium outline-none focus:border-[rgba(var(--primary-rgb),0.35)]"
            />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-black/[0.02] px-5 py-4 dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => initialData && onDelete?.(initialData.id)}
          disabled={!initialData}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black ${
            initialData ? "bg-red-50 text-red-500 dark:bg-red-950/20" : "cursor-not-allowed text-faint opacity-40"
          }`}
        >
          <Trash2 size={16} />
          删除
        </button>

        <button
          type="button"
          onClick={() => {
            const finalId = initialData?.id || (hourId === "bonus" ? `${dateStr}-bonus` : `${dateStr}-${hourIdx}`);
            onSave({
              id: finalId,
              dayOfWeek: initialData?.dayOfWeek ?? new Date(`${dateStr}T00:00:00`).getDay(),
              hourId: typeof hourId === "number" ? hourId : initialData?.hourId ?? hourIdx,
              score: isPlanned ? 0 : score,
              content,
              tagId: selectedTagId,
              status: isPlanned ? "planned" : "completed",
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
