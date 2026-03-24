"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <AnimatePresence>
      <motion.div
        key={modalKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="sheet-backdrop" onClick={onClose} />
        <RecordModalContent
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
          initialData={initialData}
          dateStr={dateStr}
          hourIdx={hourIdx}
          hourId={hourId}
        />
      </motion.div>
    </AnimatePresence>
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
  const currentTag = tags.find((tag) => tag.id === selectedTagId);
  const timeLabel = useMemo(() => {
    if (isBonusType) return "Bonus 时间块";
    return `${String(hourIdx).padStart(2, "0")}:00 时间块`;
  }, [hourIdx, isBonusType]);

  const finalId = initialData?.id || (hourId === "bonus" ? `${dateStr}-bonus` : `${dateStr}-${hourIdx}`);

  return (
    <motion.div
      initial={{ y: 56, opacity: 0.4 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 56, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="bottom-sheet no-select"
    >
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/10" />

      <div className="relative overflow-hidden rounded-t-[28px] px-5 pb-5 pt-4">
        <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(var(--primary-rgb),0.24)_0%,rgba(var(--primary-rgb),0.08)_38%,transparent_72%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-12 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(96,144,255,0.14)_0%,rgba(96,144,255,0.06)_36%,transparent_72%)]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="glass-card inline-flex h-12 w-12 items-center justify-center rounded-[18px] text-[var(--primary-color)]">
              {isBonusType ? <Zap size={20} /> : <CalendarDays size={20} />}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">TimeFlow</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">{timeLabel}</h3>
              <p className="mt-1 text-[12px] font-semibold text-faint">时流 · 记录这个时间块的目标、能量和感悟</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="rounded-full bg-black/[0.04] p-2 text-subtle dark:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        <div className="relative z-10 mt-5 grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-5">
            {!isBonusType && (
              <div className="glass-card rounded-[24px] p-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlanned(false)}
                    className={`rounded-[18px] px-4 py-3 text-sm font-black transition ${
                      !isPlanned ? "bg-white/85 text-[var(--primary-color)] dark:bg-white/[0.08]" : "text-faint"
                    }`}
                  >
                    已完成
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlanned(true)}
                    className={`rounded-[18px] px-4 py-3 text-sm font-black transition ${
                      isPlanned ? "bg-white/85 text-[var(--primary-color)] dark:bg-white/[0.08]" : "text-faint"
                    }`}
                  >
                    计划中
                  </button>
                </div>
              </div>
            )}

            <div className="glass-card rounded-[28px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black">标签</p>
                  <p className="mt-1 text-[12px] font-medium text-faint">单击时间块后才编辑标签，拖拽和长按不会误触这里。</p>
                </div>
                {currentTag ? (
                  <div className="rounded-full px-3 py-1.5 text-[12px] font-black text-white" style={{ backgroundColor: currentTag.color }}>
                    {currentTag.emoji} {currentTag.name}
                  </div>
                ) : (
                  <div className="rounded-full bg-black/[0.04] px-3 py-1.5 text-[12px] font-black text-faint dark:bg-white/[0.06]">
                    未设置
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTagId(undefined)}
                  className={`rounded-[18px] border px-3 py-3 text-[12px] font-black transition ${
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
                    className={`rounded-[18px] border px-3 py-3 text-left transition ${
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
              <div className="glass-card rounded-[28px] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black">能量评分</p>
                    <p className="mt-1 text-[12px] font-medium text-faint">延续充能感，只把评分做成发光焦点，不抢正文信息。</p>
                  </div>
                  <div className="rounded-full bg-[rgba(var(--primary-rgb),0.12)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                    {score.toFixed(2).replace(/\.00$/, "")}
                  </div>
                </div>
                <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.12),rgba(255,255,255,0.22))] p-4">
                  <StarRating value={score} onChange={setScore} size={30} />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="glass-card rounded-[28px] p-4">
              <label className="mb-3 block text-sm font-black">{isPlanned ? "计划说明" : "感悟说明"}</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={isPlanned ? "写下这个时间块之后想完成什么。" : "写下这段时间的感受、收获或提醒。"}
                className="min-h-[180px] w-full resize-none rounded-[24px] border border-[var(--border-color)] bg-white/55 px-5 py-4 text-[14px] font-medium outline-none transition focus:border-[rgba(var(--primary-rgb),0.35)] dark:bg-white/[0.03]"
              />
            </div>

            <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.13),rgba(255,255,255,0.55))] p-4">
              <p className="text-[12px] font-black text-[var(--primary-color)]">能量提示</p>
              <p className="mt-2 text-lg font-black tracking-[-0.04em]">
                {isPlanned ? "先把目标写清楚，再回来充能。" : "保持这个节奏，下一次长按会继续往上充一级。"}
              </p>
            </div>
          </section>
        </div>

        <div className="relative z-10 mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
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
    </motion.div>
  );
}
