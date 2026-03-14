"use client";

import { useState } from "react";
import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from "lucide-react";

function generateMonthCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = Array(firstDay).fill(null);
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

export default function MonthPage() {
  const { blocks, settings } = useTimeStore();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Default March 2026
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const weeks = generateMonthCalendar(year, month);

  const getDailyData = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dayBlocks = Object.keys(blocks)
      .filter(key => key.startsWith(dateStr))
      .map(key => blocks[key])
      .filter(b => b.status === 'completed');
    
    if (dayBlocks.length > 0) {
      const energy = dayBlocks.reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
      return { energy, count: dayBlocks.length };
    }
    return null;
  };

  const monthDailyScores: Record<number, { energy: number; count: number }> = {};
  for (let d = 1; d <= 31; d++) {
    const data = getDailyData(year, month, d);
    if (data) monthDailyScores[d] = data;
  }

  const maxMonthEnergy = Math.max(...Object.values(monthDailyScores).map(d => Math.abs(d.energy)), 0.1);

  function getHeatColor(energy: number | null, maxE: number) {
    if (energy === null) return 'var(--score-empty)';
    if (energy < 0) return 'var(--score-punish)';
    const intensity = Math.min(energy / maxE, 1);
    if (intensity < 0.25) return 'var(--score-1)';
    if (intensity < 0.50) return 'var(--score-2)';
    if (intensity < 0.75) return 'var(--score-3)';
    return 'var(--score-4)';
  }

  const navigateMonth = (dir: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  };

  const activeDays = Object.keys(monthDailyScores).length;
  const totalMonthEnergy = Object.values(monthDailyScores).reduce((a, d) => a + d.energy, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-32 sm:pb-12">
      <header className="px-4 sm:px-6 py-4 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-[22px] font-black tracking-tight flex items-center gap-2">
            全景视野
          </h1>
          <p className="text-[12px] sm:text-[13px] text-gray-400 font-bold tracking-widest uppercase">
            {year}年 · {viewMode === 'month' ? MONTH_NAMES[month] : '年度概览'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black/[0.03] dark:bg-white/5 p-1 rounded-full mr-2">
             <button 
               onClick={() => setViewMode('month')}
               className={`px-4 py-1.5 rounded-full text-[12px] font-black transition-all ${viewMode === 'month' ? 'bg-white dark:bg-white/10 shadow-sm text-amber-500' : 'text-gray-400'}`}
             >
               月度
             </button>
             <button 
               onClick={() => setViewMode('year')}
               className={`px-4 py-1.5 rounded-full text-[12px] font-black transition-all ${viewMode === 'year' ? 'bg-white dark:bg-white/10 shadow-sm text-amber-500' : 'text-gray-400'}`}
             >
               年度
             </button>
          </div>

          {viewMode === 'month' && (
            <div className="flex rounded-full bg-black/5 dark:bg-white/5 p-1 gap-0.5">
              <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        {viewMode === 'month' ? (
          <>
            {/* Month Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatItem label="活跃天数" value={activeDays} />
              <StatItem label="月度能量" value={`${totalMonthEnergy > 0 ? '+' : ''}${totalMonthEnergy.toFixed(settings.decimalPlaces)}★`} highlight />
              <StatItem label="单日均值" value={`${activeDays > 0 ? (totalMonthEnergy / activeDays).toFixed(settings.decimalPlaces) : 0}★`} />
            </div>

            {/* Month Heatmap */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-10 border border-white/20 dark:border-white/5 shadow-inner">
               <div className="grid grid-cols-7 gap-3 sm:gap-4 mb-4">
                 {WEEKDAY_NAMES.map(name => (
                   <div key={name} className="text-center text-[11px] text-gray-400 font-black tracking-widest">{name}</div>
                 ))}
               </div>

               <div className="space-y-3 sm:space-y-4">
                 {weeks.map((week, wi) => (
                   <div key={wi} className="grid grid-cols-7 gap-3 sm:gap-4">
                     {week.map((day, di) => {
                       const data = day ? monthDailyScores[day] : null;
                       const energy = data?.energy ?? null;
                       return (
                         <div
                           key={di}
                           className={`aspect-square rounded-[18px] sm:rounded-[22px] flex flex-col items-center justify-center transition-all duration-300 relative group
                             ${day === null ? 'opacity-0' : 'hover:scale-110 hover:shadow-xl hover:z-10 cursor-pointer'}
                           `}
                           style={{ backgroundColor: getHeatColor(energy, maxMonthEnergy) }}
                         >
                           {day !== null && (
                             <>
                               <span className={`text-[14px] sm:text-[18px] font-black ${energy !== null && (energy >= 3 || energy < 0) ? 'text-white' : 'text-[var(--foreground)]'}`}>
                                 {day}
                               </span>
                               {energy !== null && (
                                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                                    {energy.toFixed(1)}★ · {data?.count} 时段
                                  </div>
                               )}
                             </>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 ))}
               </div>
               
                <div className="flex items-center justify-center gap-2 mt-10">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">低强度</span>
                  {[0, 0.2, 0.4, 0.6, 0.8].map(i => (
                    <div key={i} className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: getHeatColor(i, 1) }} />
                  ))}
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">高强度</span>
                </div>
            </div>
          </>
        ) : (
          /* Yearly View */
          <div className="space-y-8 animate-spring">
             <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-8 text-white shadow-xl shadow-amber-500/20">
                <h2 className="text-2xl font-black">{year} 年度星历</h2>
                <p className="opacity-80 text-sm font-bold mt-1 tracking-widest uppercase">365 天的心流观测</p>
                <div className="mt-8 grid grid-cols-4 gap-4">
                   <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-black opacity-60 uppercase">总星数</p>
                      <p className="text-2xl font-black mt-1">N/A</p>
                   </div>
                   <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-black opacity-60 uppercase">心流占比</p>
                      <p className="text-2xl font-black mt-1">N/A</p>
                   </div>
                   <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-black opacity-60 uppercase">最佳月份</p>
                      <p className="text-2xl font-black mt-1">三月</p>
                   </div>
                </div>
             </div>

             <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-8 border border-white/20 dark:border-white/5 overflow-x-auto">
                <div className="min-w-[800px] space-y-6">
                   <div className="flex gap-px">
                      {MONTH_NAMES.map(m => (
                        <div key={m} className="flex-1 text-[10px] font-black text-gray-400 text-center">{m}</div>
                      ))}
                   </div>
                   
                   <div className="flex flex-wrap gap-1.5 justify-start">
                      {Array.from({ length: 365 }, (_, i) => {
                        const date = new Date(year, 0, i + 1);
                        const data = getDailyData(year, date.getMonth(), date.getDate());
                        const energy = data?.energy ?? null;
                        return (
                          <div 
                            key={i} 
                            className="w-4 h-4 rounded-md shadow-sm group relative hover:scale-125 transition-transform" 
                            style={{ backgroundColor: getHeatColor(energy, 5) }}
                          >
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-2 py-1 rounded-lg text-[9px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl z-50">
                              {date.getMonth()+1}/{date.getDate()}: {energy ? energy.toFixed(1) : 0}★
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={`rounded-3xl p-5 border border-white/20 dark:border-white/5 text-center transition-all hover:scale-[1.03] shadow-inner
      ${highlight ? 'bg-amber-100/30 dark:bg-amber-500/10' : 'bg-black/[0.015] dark:bg-white/[0.015]'}
    `}>
      <p className="text-[11px] text-gray-400 font-black tracking-widest uppercase">{label}</p>
      <p className={`text-2xl sm:text-3xl font-black mt-1 ${highlight ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>{value}</p>
    </div>
  );
}
