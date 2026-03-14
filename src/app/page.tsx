import WeekGrid from "@/components/grid/WeekGrid";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <div>
          <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">一周规划</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">2026年3月16日 - 3月22日</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95">
            本周
          </button>
          <div className="flex rounded-full bg-black/5 dark:bg-white/5 p-1 gap-0.5">
            <button className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="p-1.5 sm:p-2 rounded-full hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all text-gray-500 hover:text-black dark:hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <WeekGrid />
      </div>
    </div>
  );
}
