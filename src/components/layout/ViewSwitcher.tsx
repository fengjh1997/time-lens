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
  const activeIndex = Math.max(0, views.findIndex((view) => view.id === currentView));

  return (
    <div className="glass-card relative flex rounded-full p-1 no-select">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={`relative z-10 w-16 rounded-full px-4 py-2 text-[13px] font-black transition-all ${
            currentView === view.id ? "text-[var(--primary-color)]" : "text-faint"
          }`}
        >
          {view.label}
        </button>
      ))}

      <motion.div
        layoutId="active-view"
        className="absolute inset-y-1 rounded-full bg-white/85 shadow-sm dark:bg-white/[0.08]"
        animate={{ left: activeIndex * 64 + 4, width: 56 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </div>
  );
}
