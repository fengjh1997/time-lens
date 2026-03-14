"use client";

import { useState } from "react";
import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      const count = dayBlocks.length;
      return { energy, count };
    }
    return null;
  };

  const monthDailyScores: Record<number, { energy: number; count: number }> = {};
  for (let d = 1; d <= 31; d++) {
    const data = getDailyData(year, month, d);
    if (data) monthDailyScores[d] = data;
  }

  const maxMonthEnergy = Math.max(...Object.values(monthDailyScores).map(d => Math.abs(d.energy)), 5);

  function getHeatColor(energy: number | null, maxE: number) {
    if (energy === null || energy === 0) return 'var(--score-empty)';
    if (energy < 0) return 'var(--score-punish)';
    
    // Scale energy to 4 levels similar to Star Energy
    // Level 1: 0 < E <= 2 | Level 2: 2 < E <= 4 | Level 3: 4 < E <= 6 | Level 4: E > 6
    if (energy <= 2) return 'var(--score-1)';
    if (energy <= 4) return 'var(--score-2)';
    if (energy <= 6) return 'var(--score-3)';
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
      <header className="px-4 sm:px-6 py-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-20 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[24px] font-black tracking-tight">全景视野</h1>
          <p className="text-[12px] text-gray-400 font-bold tracking-widest uppercase mt-1">
            {year}年 · {viewMode === 'month' ? MONTH_NAMES[month] : '年度概览'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-black/[0.03] dark:bg-white/5 p-1 rounded-full">
             <button 
               onClick={() => setViewMode('month')}
               className={`px-5 py-1.5 rounded-full text-[12px] font-black transition-all ${viewMode === 'month' ? 'bg-white dark:bg-white/10 shadow-lg text-[var(--primary-color)]' : 'text-gray-400'}`}
             >
               月度
             </button>
             <button 
               onClick={() => setViewMode('year')}
               className={`px-5 py-1.5 rounded-full text-[12px] font-black transition-all ${viewMode === 'year' ? 'bg-white dark:bg-white/10 shadow-lg text-[var(--primary-color)]' : 'text-gray-400'}`}
             >
               年度
             </button>
          </div>

          {viewMode === 'month' && (
            <div className="flex rounded-full bg-black/[0.03] dark:bg-white/5 p-1 gap-1">
              <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-[var(--primary-color)] transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-[var(--primary-color)] transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-10">
        {viewMode === 'month' ? (
          <>
            {/* Month Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <StatItem label="活跃天数" value={activeDays} />
              <StatItem label="本月能量" value={`${totalMonthEnergy > 0 ? '+' : ''}${totalMonthEnergy.toFixed(settings.decimalPlaces)}★`} highlight />
              <StatItem label="累计记录" value={Object.values(monthDailyScores).reduce((a, d) => a + d.count, 0)} />
            </div>

            {/* Month Heatmap */}
            <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[40px] p-8 sm:p-12 border border-[var(--border-color)]">
               <div className="grid grid-cols-7 gap-4 sm:gap-6 mb-6">
                 {WEEKDAY_NAMES.map(name => (
                   <div key={name} className="text-center text-[11px] text-gray-400 font-black tracking-widest">{name}</div>
                 ))}
               </div>

               <div className="space-y-4 sm:y-6">
                 {weeks.map((week, wi) => (
                   <div key={wi} className="grid grid-cols-7 gap-4 sm:gap-6">
                     {week.map((day, di) => {
                       const data = day ? monthDailyScores[day] : null;
                       const energy = data?.energy ?? null;
                       const isHigh = energy !== null && energy >= 3;
                       return (
                         <div
                           key={di}
                           className={`aspect-square rounded-[20px] sm:rounded-[28px] flex flex-col items-center justify-center transition-all duration-500 relative group
                             ${day === null ? 'opacity-0' : 'hover:scale-110 hover:shadow-2xl hover:z-10 cursor-pointer shadow-sm'}
                           `}
                           style={{ backgroundColor: getHeatColor(energy, maxMonthEnergy) }}
                         >
                           {day !== null && (
                             <>
                               <span className={`text-[15px] sm:text-[19px] font-black ${isHigh || (energy !== null && energy < 0) ? 'text-white' : 'text-[var(--foreground)] opacity-70'}`}>
                                 {day}
                               </span>
                               {energy !== null && (
                                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-3 py-2 rounded-2xl text-[11px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-50">
                                    {energy.toFixed(1)}★ · {data?.count} 个记录
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
               
                <div className="flex items-center justify-center gap-3 mt-12">
                   <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">能量层级</div>
                   <div className="flex gap-1.5">
                     {[0, 2, 4, 6, 8].map(i => (
                        <div key={i} className="w-5 h-5 rounded-lg border border-black/[0.03]" style={{ backgroundColor: getHeatColor(i, 8) }} />
                     ))}
                   </div>
                </div>
            </div>
          </>
        ) : (
          /* Yearly View */
          <div className="space-y-10 animate-spring">
             <div className="bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/60 rounded-[40px] p-10 text-white shadow-2xl shadow-[var(--primary-glow)]">
                <h2 className="text-[28px] font-black">2026 年度星历</h2>
                <p className="opacity-70 text-[13px] font-bold mt-1 tracking-widest uppercase">全生命周期心流观测</p>
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                   <StatCard label="总打卡天数" value={activeDays} />
                   <StatCard label="年度累计能量" value={`${totalMonthEnergy.toFixed(1)}★`} />
                   <StatCard label="月度最佳" value="三月" />
                   <StatCard label="连续最长" value="12 天" />
                </div>
             </div>

             <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[40px] p-8 sm:p-10 border border-[var(--border-color)] overflow-x-auto">
                <div className="min-w-[900px] space-y-8">
                   <div className="flex gap-px">
                      {MONTH_NAMES.map(m => (
                        <div key={m} className="flex-1 text-[11px] font-black text-gray-400 text-center uppercase tracking-tighter">{m}</div>
                      ))}
                   </div>
                   
                   <div className="flex flex-wrap gap-2 justify-start">
                      {Array.from({ length: 365 }, (_, i) => {
                        const date = new Date(year, 0, i + 1);
                        const data = getDailyData(year, date.getMonth(), date.getDate());
                        const energy = data?.energy ?? null;
                        return (
                          <div 
                            key={i} 
                            className="w-4.5 h-4.5 rounded-lg shadow-sm group relative hover:scale-150 transition-all hover:z-20 cursor-pointer" 
                            style={{ backgroundColor: getHeatColor(energy, 6) }}
                          >
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-2.5 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-50">
                              {date.getMonth()+1}月{date.getDate()}日: {energy ? energy.toFixed(1) : 0}★
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
    <div className={`rounded-[28px] p-6 border transition-all hover:scale-[1.03] shadow-sm flex flex-col items-center justify-center gap-2
      ${highlight 
        ? 'bg-[var(--primary-light)] border-[var(--primary-color)]/20' 
        : 'bg-black/[0.02] dark:bg-white/[0.02] border-[var(--border-color)]'
      }
    `}>
      <p className="text-[11px] text-gray-400 font-black tracking-widest uppercase">{label}</p>
      <p className={`text-[22px] sm:text-[28px] font-black tracking-tight ${highlight ? 'text-[var(--primary-color)]' : 'text-[var(--foreground)]'}`}>{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/5">
       <p className="text-[11px] font-black opacity-60 uppercase tracking-widest">{label}</p>
       <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
