"use client";

import { motion } from "framer-motion";

export type TimeView = "day" | "week" | "month" | "year";

interface ViewSwitcherProps {
  currentView: TimeView;
  onViewChange: (view: TimeView) => void;
}

const views: Array<{ id: TimeView; label: string }> = [
  { id: "day", label: "日" },
  { id: "week", label: "周" },
];

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const activeIndex = Math.max(
    0,
    views.findIndex((view) => view.id === currentView),
  );

  return (
    <div className="relative flex rounded-full bg-black/[0.05] p-1 dark:bg-white/10">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={`relative z-10 w-16 rounded-full px-4 py-2 text-[13px] font-black transition-all ${
            currentView === view.id ? "text-[var(--primary-color)]" : "text-gray-400"
          }`}
        >
          {view.label}
        </button>
      ))}

      <motion.div
        layoutId="activeView"
        className="absolute inset-y-1 rounded-full bg-white shadow-sm dark:bg-white/10"
        animate={{ left: activeIndex * 64 + 4, width: 56 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
