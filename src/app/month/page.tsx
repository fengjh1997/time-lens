"use client";

import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";

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

export default function MonthPage() {
  const { blocks, settings } = useTimeStore();
  const year = 2026;
  const month = 2;
  const weeks = generateMonthCalendar(year, month);

  const dailyScores: Record<number, { energy: number; count: number }> = {};
  for (let day = 1; day <= 31; day++) {
    const dateStr = `${year}-03-${day.toString().padStart(2, '0')}`;
    const dayBlocks = Object.keys(blocks)
      .filter(key => key.startsWith(dateStr))
      .map(key => blocks[key])
      .filter(b => b.status === 'completed');
    
    if (dayBlocks.length > 0) {
      const energy = dayBlocks.reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
      dailyScores[day] = { energy, count: dayBlocks.length };
    }
  }

  const maxEnergy = Math.max(...Object.values(dailyScores).map(d => d.energy), 0.1);

  function getHeatColor(day: number | null) {
    if (day === null) return 'transparent';
    const data = dailyScores[day];
    if (!data) return 'var(--score-empty)';
    const { energy } = data;
    if (energy < 0) return 'var(--score-punish)';
    const intensity = Math.min(energy / maxEnergy, 1);
    if (intensity < 0.25) return 'var(--score-1)';
    if (intensity < 0.50) return 'var(--score-2)';
    if (intensity < 0.75) return 'var(--score-3)';
    return 'var(--score-4)';
  }

  const activeDays = Object.keys(dailyScores).length;
  const totalMonthEnergy = Object.values(dailyScores).reduce((a, d) => a + d.energy, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-28 sm:pb-8">
      <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">月度全景</h1>
        <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">2026年3月 · 热力日历</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-5 sm:space-y-8">
        {/* Summary */}
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-4 sm:p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest">活跃天数</p>
            <p className="text-2xl sm:text-3xl font-black mt-1">{activeDays}</p>
          </div>
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-4 sm:p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest">月度能量</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
              {totalMonthEnergy > 0 ? '+' : ''}{totalMonthEnergy.toFixed(settings.decimalPlaces)}★
            </p>
          </div>
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-4 sm:p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest">日均能量</p>
            <p className="text-2xl sm:text-3xl font-black mt-1">{activeDays > 0 ? (totalMonthEnergy / activeDays).toFixed(settings.decimalPlaces) : 0}★</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 border border-white/30 dark:border-white/5">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 sm:mb-3">
            {WEEKDAY_NAMES.map(name => (
              <div key={name} className="text-center text-[10px] sm:text-[11px] text-gray-400 font-bold">{name}</div>
            ))}
          </div>

          <div className="space-y-2 sm:space-y-3">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-2 sm:gap-3">
                {week.map((day, di) => {
                  const data = day ? dailyScores[day] : null;
                  const hasData = day !== null && data;
                  return (
                    <div
                      key={di}
                      className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-default group relative
                        ${day === null ? '' : 'hover:scale-110 hover:shadow-lg hover:z-10'}
                      `}
                      style={{ backgroundColor: getHeatColor(day) }}
                    >
                      {day !== null && (
                        <>
                          <span className={`text-[13px] sm:text-[16px] font-black ${hasData && data.energy >= 3 ? 'text-white' : hasData && data.energy < 0 ? 'text-white' : ''}`}>
                            {day}
                          </span>
                          {hasData && (
                            <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 ${data.energy >= 3 ? 'text-white/80' : data.energy < 0 ? 'text-white/80' : 'text-black/50 dark:text-white/50'}`}>
                              {data.energy > 0 ? '+' : ''}{data.energy.toFixed(1)}★
                            </span>
                          )}
                        </>
                      )}
                      {hasData && (
                        <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                          {data.count} 时段 · {data.energy.toFixed(1)}★
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">低</span>
            {['var(--score-empty)', 'var(--score-1)', 'var(--score-2)', 'var(--score-3)', 'var(--score-4)'].map((color, i) => (
              <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded-md" style={{ backgroundColor: color }} />
            ))}
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">高</span>
          </div>
        </div>
      </div>
    </div>
  );
}
