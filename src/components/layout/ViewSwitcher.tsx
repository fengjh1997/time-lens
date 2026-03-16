"use client";

import { motion } from "framer-motion";

export type TimeView = 'day' | 'week' | 'month' | 'year';

interface ViewSwitcherProps {
  currentView: TimeView;
  onViewChange: (view: TimeView) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views: { id: TimeView; label: string }[] = [
    { id: 'day', label: '日' },
    { id: 'week', label: '周' },
    { id: 'month', label: '月' },
    { id: 'year', label: '年' }
  ];

  return (
    <div className="flex bg-black/[0.05] dark:bg-white/10 p-1 rounded-[20px] relative">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`relative z-10 px-6 py-2 text-[13px] font-black transition-all duration-300 w-16
            ${currentView === view.id ? 'text-[var(--primary-color)]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
          `}
        >
          {view.label}
        </button>
      ))}
      
      {/* Active Indicator */}
      <motion.div
        layoutId="activeView"
        className="absolute inset-y-1 bg-white dark:bg-white/10 rounded-[16px] shadow-sm z-0"
        initial={false}
        animate={{
          left: views.findIndex(v => v.id === currentView) * 64 + 4,
          width: 64 - 8
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
