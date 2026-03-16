"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WeekGrid from "@/components/grid/WeekGrid";
import DayGrid from "@/components/grid/DayGrid";
import ViewSwitcher, { type TimeView } from "@/components/layout/ViewSwitcher";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [view, setView] = useState<TimeView>((searchParams.get('view') as TimeView) || 'week');
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  const today = new Date();
  const targetDate = new Date();
  
  useEffect(() => {
    // Sync view from URL if it changes externally
    const urlView = searchParams.get('view') as TimeView;
    if (urlView && urlView !== view) setView(urlView);
  }, [searchParams]);

  const handleViewChange = (newView: TimeView) => {
    setView(newView);
    router.replace(`/?view=${newView}&offset=${offset}`);
  };

  // Adjust date calculations based on view
  let dateRangeLabel = "";
  let weekDates: string[] = [];
  const currentDayStr = formatDate(today);

  if (view === 'day') {
    targetDate.setDate(today.getDate() + offset);
    dateRangeLabel = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
  } else if (view === 'week') {
    targetDate.setDate(today.getDate() + (offset * 7));
    const monday = getMonday(targetDate);
    for (let i = 0; i < 7; i++) {
       const d = new Date(monday);
       d.setDate(monday.getDate() + i);
       weekDates.push(formatDate(d));
    }
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    dateRangeLabel = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`;
  } else {
    // Month view placeholder or initial logic
    dateRangeLabel = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`;
  }

  const navigate = (dir: number) => {
    router.push(`/?view=${view}&offset=${offset + dir}`);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <header className="px-4 sm:px-6 py-4 flex flex-col gap-4 border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              Time Lens
              <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse" />
            </h1>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{dateRangeLabel}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2.5 rounded-full bg-black/[0.03] dark:bg-white/10 text-gray-500 hover:text-[var(--primary-color)] transition-all">
                <Share2 size={18} />
             </button>
             <ViewSwitcher currentView={view} onViewChange={handleViewChange} />
          </div>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push(`/?view=${view}&offset=0`)}
                className="px-5 py-2 text-[13px] font-black rounded-full bg-black/[0.05] dark:bg-white/10 hover:shadow-sm transition-all active:scale-95"
              >
                回到今日
              </button>
           </div>
           
           <div className="flex items-center gap-1.5 bg-black/[0.05] dark:bg-white/10 p-1.5 rounded-full">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all"><ChevronLeft size={18} /></button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
              <button onClick={() => navigate(1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + offset}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="h-full"
          >
            {view === 'day' && <DayGrid dateStr={formatDate(targetDate)} />}
            {view === 'week' && <WeekGrid weekDates={weekDates} />}
            {view === 'month' && (
              <div className="flex items-center justify-center h-full text-gray-300 font-black uppercase tracking-[0.2em]">
                月中枢系统开发中...
              </div>
            )}
            {view === 'year' && (
              <div className="flex items-center justify-center h-full text-gray-300 font-black uppercase tracking-[0.2em]">
                年视角导航开发中...
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400 font-black tracking-widest uppercase animate-pulse">Initializing Core...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
