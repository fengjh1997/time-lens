"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Tags, Trash2, X, Zap } from "lucide-react";
import { useTimeStore } from "@/store/timeStore";
import { MiniStarDisplay } from "@/components/ui/StarRating";
import { getBlockTagIds } from "@/lib/blockTags";
import type { Score, Tag, TimeBlock } from "@/types";

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

const SCORE_OPTIONS: Array<{ score: Score; label: string }> = [
  { score: -1, label: "惩罚" },
  { score: 0, label: "留白" },
  { score: 0.25, label: "0.25" },
  { score: 0.5, label: "0.50" },
  { score: 0.75, label: "0.75" },
  { score: 1, label: "1.00" },
];

export default function RecordModal(props: RecordModalProps) {
  const { isOpen, initialData, dateStr = "", hourIdx = 0, hourId } = props;
  if (!isOpen) return null;

  const modalKey = `${initialData?.id || `${dateStr}-${String(hourId ?? hourIdx)}`}-${initialData?.updatedAt || "new"}`;

  return (
    <AnimatePresence>
      <motion.div key={modalKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="sheet-backdrop" onClick={props.onClose} />
        <RecordModalContent {...props} />
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
  const { tags, blocks } = useTimeStore();
  const [content, setContent] = useState(initialData?.content || "");
  const [score, setScore] = useState<Score>(initialData?.score || 0);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(getBlockTagIds(initialData));
  const [isPlanned, setIsPlanned] = useState(initialData?.status === "planned");
  const [showTagSheet, setShowTagSheet] = useState(false);
  const lastSavedRef = useRef("");

  const isBonusType = hourId === "bonus" || initialData?.isBonus;
  const finalId = initialData?.id || (hourId === "bonus" ? `${dateStr}-bonus` : `${dateStr}-${hourIdx}`);

  const selectedTags = selectedTagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is Tag => Boolean(tag));

  const recentTags = useMemo(() => {
    const recentIds = Object.values(blocks)
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .flatMap((block) => getBlockTagIds(block))
      .filter((tagId, index, array) => array.indexOf(tagId) === index)
      .slice(0, 5);

    return recentIds
      .map((tagId) => tags.find((tag) => tag.id === tagId))
      .filter((tag): tag is Tag => Boolean(tag));
  }, [blocks, tags]);

  const timeLabel = useMemo(() => {
    if (isBonusType) return "Bonus 时间块";
    return `${String(hourIdx).padStart(2, "0")}:00 时间块`;
  }, [hourIdx, isBonusType]);

  const payload = useMemo<TimeBlock>(
    () => ({
      id: finalId,
      dayOfWeek: initialData?.dayOfWeek ?? new Date(`${dateStr}T00:00:00`).getDay(),
      hourId: typeof hourId === "number" ? hourId : initialData?.hourId ?? hourIdx,
      score: isPlanned ? 0 : score,
      content,
      tagId: selectedTagIds[0],
      tagIds: selectedTagIds,
      status: isPlanned ? "planned" : "completed",
      isBonus: isBonusType,
      updatedAt: new Date().toISOString(),
    }),
    [content, dateStr, finalId, hourId, hourIdx, initialData?.dayOfWeek, initialData?.hourId, isBonusType, isPlanned, score, selectedTagIds],
  );

  useEffect(() => {
    lastSavedRef.current = JSON.stringify({
      content: initialData?.content || "",
      score: initialData?.status === "planned" ? 0 : initialData?.score || 0,
      status: initialData?.status || "completed",
      tagIds: getBlockTagIds(initialData),
    });
  }, [initialData]);

  useEffect(() => {
    const hasValue = isPlanned || score !== 0 || content.trim().length > 0 || selectedTagIds.length > 0 || Boolean(initialData);
    if (!hasValue) return;

    const snapshot = JSON.stringify({
      content: payload.content,
      score: payload.score,
      status: payload.status,
      tagIds: payload.tagIds,
    });

    if (snapshot === lastSavedRef.current) return;

    const timeoutId = window.setTimeout(() => {
      onSave(payload);
      lastSavedRef.current = snapshot;
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [content, initialData, isPlanned, onSave, payload, score, selectedTagIds.length]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
    );
  };

  const topTags = recentTags.length > 0 ? recentTags : selectedTags;

  return (
    <>
      <motion.div
        initial={{ y: 72, opacity: 0.36, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 72, opacity: 0, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.9 }}
        className="bottom-sheet no-select"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/10" />

        <div className="relative overflow-hidden rounded-t-[28px] px-5 pb-5 pt-4">
          <div className="pointer-events-none absolute inset-x-6 top-16 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--primary-rgb),0.28),transparent)]" />
          <div className="pointer-events-none absolute inset-x-10 bottom-20 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--primary-rgb),0.18),transparent)]" />
          <div className="pointer-events-none absolute right-10 top-12 h-2 w-2 rounded-full bg-[rgba(var(--primary-rgb),0.32)]" />
          <div className="pointer-events-none absolute left-8 bottom-28 h-1.5 w-1.5 rounded-full bg-[rgba(var(--primary-rgb),0.22)]" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="glass-card inline-flex h-12 w-12 items-center justify-center rounded-[18px] text-[var(--primary-color)]">
                {isBonusType ? <Zap size={20} /> : <CalendarDays size={20} />}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">TimeFlow</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.05em]">{timeLabel}</h3>
              </div>
            </div>

            <button type="button" onClick={onClose} className="rounded-full bg-black/[0.04] p-2 text-subtle dark:bg-white/[0.06]">
              <X size={16} />
            </button>
          </div>

          <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[rgba(var(--primary-rgb),0.12)] bg-white/55 px-4 py-3 backdrop-blur-sm dark:bg-white/[0.04]">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary-color)]">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {topTags.length > 0 ? (
                  topTags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                          active ? "text-white shadow-md" : "bg-black/[0.05] text-[var(--foreground)] dark:bg-white/[0.06]"
                        }`}
                        style={active ? { backgroundColor: tag.color } : undefined}
                      >
                        {tag.emoji} {tag.name}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-black text-faint dark:bg-white/[0.06]">
                    未设置标签
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTagSheet(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2 text-[12px] font-black text-white shadow-lg shadow-[var(--primary-glow)]"
            >
              <Tags size={14} />
              选择标签
            </button>
          </div>

          <div className="relative z-10 mt-5 space-y-4">
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

            {!isPlanned && (
              <div className="glass-card rounded-[28px] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black">能量评分</p>
                  <div className="rounded-full bg-[rgba(var(--primary-rgb),0.12)] px-3 py-1.5 text-[12px] font-black text-[var(--primary-color)]">
                    {score.toFixed(2).replace(/\.00$/, "")}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-[24px] bg-[linear-gradient(135deg,rgba(var(--primary-rgb),0.12),rgba(255,255,255,0.22))] p-4">
                  <InlineScorePicker value={score} onChange={setScore} />
                </div>
              </div>
            )}

            <div className="glass-card rounded-[28px] p-4">
              <label className="mb-3 block text-sm font-black">{isPlanned ? "计划说明" : "感悟说明"}</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={isPlanned ? "写下这个时间块之后想完成什么。" : "写下这段时间的感受、收获或提醒。"}
                className="min-h-[108px] w-full resize-none rounded-[24px] border border-[var(--border-color)] bg-white/55 px-5 py-4 text-[14px] font-medium outline-none transition focus:border-[rgba(var(--primary-rgb),0.35)] dark:bg-white/[0.03]"
              />
            </div>
          </div>

          <div className="relative z-10 mt-5 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
            <button
              type="button"
              onClick={() => {
                if (!initialData) return;
                onDelete?.(initialData.id);
              }}
              disabled={!initialData}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black ${
                initialData ? "bg-red-50 text-red-500 dark:bg-red-950/20" : "cursor-not-allowed text-faint opacity-40"
              }`}
            >
              <Trash2 size={16} />
              清空时间块
            </button>

            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--primary-rgb),0.12)] px-4 py-2 text-[12px] font-black text-[var(--primary-color)]">
              自动保存
            </div>
          </div>
        </div>
      </motion.div>

      <TagPickerSheet
        isOpen={showTagSheet}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onClose={() => setShowTagSheet(false)}
        onToggle={toggleTag}
        onClear={() => setSelectedTagIds([])}
      />
    </>
  );
}

function InlineScorePicker({
  value,
  onChange,
}: {
  value: Score;
  onChange: (score: Score) => void;
}) {
  return (
    <div className="grid min-w-[520px] grid-cols-6 gap-2">
      {SCORE_OPTIONS.map((option) => {
        const active = value === option.score;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.score)}
            className={`flex min-w-0 flex-col items-center gap-2 rounded-[20px] px-1 py-4 transition ${
              active
                ? "bg-[var(--primary-light)] ring-2 ring-[var(--primary-color)] shadow-lg shadow-[var(--primary-glow)]"
                : "bg-black/[0.03] text-faint dark:bg-white/[0.05]"
            }`}
          >
            <MiniStarDisplay score={option.score} size={26} color={active ? "var(--primary-color)" : undefined} />
            <span className={`text-[11px] font-black ${active ? "text-[var(--primary-color)]" : "text-faint"}`}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TagPickerSheet({
  isOpen,
  tags,
  selectedTagIds,
  onToggle,
  onClear,
  onClose,
}: {
  isOpen: boolean;
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="sheet-backdrop z-[55]" onClick={onClose} />
          <motion.div
            initial={{ y: 72, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="bottom-sheet z-[60] no-select"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--primary-color)]">Tag Drawer</p>
                <h4 className="mt-1 text-xl font-black">选择标签</h4>
              </div>
              <button type="button" onClick={onClose} className="rounded-full bg-black/[0.04] p-2 text-subtle dark:bg-white/[0.06]">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="mb-4 flex items-center justify-end">
                <button type="button" onClick={onClear} className="text-[12px] font-black text-[var(--primary-color)]">
                  清空
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {tags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => onToggle(tag.id)}
                      className={`rounded-[20px] border px-4 py-4 text-left transition ${
                        active ? "border-transparent text-white shadow-lg" : "border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.03]"
                      }`}
                      style={active ? { backgroundColor: tag.color } : undefined}
                    >
                      <div className="text-2xl">{tag.emoji}</div>
                      <div className="mt-2 text-[13px] font-black">{tag.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
