"use client";

import { useTimeStore, SCORE_POINTS } from "@/store/timeStore";

// Generate the days of March 2026 (Sun=0 start)
function generateMonthCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
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
  const { blocks } = useTimeStore();
  const year = 2026;
  const month = 2; // March (0-indexed)
  const weeks = generateMonthCalendar(year, month);

  // Calculate daily scores for all days
  const dailyScores: Record<number, { score: number; count: number }> = {};
  for (let day = 1; day <= 31; day++) {
    const dateStr = `${year}-03-${day.toString().padStart(2, '0')}`;
    const dayBlocks = Object.keys(blocks)
      .filter(key => key.startsWith(dateStr))
      .map(key => blocks[key]);
    
    if (dayBlocks.length > 0) {
      const score = dayBlocks.reduce((acc, b) => acc + SCORE_POINTS[b.score], 0);
      dailyScores[day] = { score, count: dayBlocks.length };
    }
  }

  const maxScore = Math.max(...Object.values(dailyScores).map(d => d.score), 1);

  function getHeatColor(day: number | null) {
    if (day === null) return 'transparent';
    const data = dailyScores[day];
    if (!data) return 'var(--score-empty)';
    
    const { score } = data;
    if (score < 0) return 'var(--score-punish)';
    
    const intensity = Math.min(score / maxScore, 1);
    if (intensity < 0.25) return 'var(--score-1)';
    if (intensity < 0.50) return 'var(--score-2)';
    if (intensity < 0.75) return 'var(--score-3)';
    return 'var(--score-4)';
  }

  // Summary stats
  const activeDays = Object.keys(dailyScores).length;
  const totalMonthScore = Object.values(dailyScores).reduce((a, d) => a + d.score, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
      <header className="px-8 py-5 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-[22px] font-bold tracking-tight">月度全景</h1>
        <p className="text-[13px] text-gray-400 mt-1.5 font-medium">2026年3月 · 热力日历</p>
      </header>

      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">

        {/* Summary Row */}
        <div className="flex gap-4">
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[11px] text-gray-400 font-bold tracking-widest">活跃天数</p>
            <p className="text-3xl font-black text-[var(--foreground)] mt-1">{activeDays}</p>
          </div>
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[11px] text-gray-400 font-bold tracking-widest">月度能量值</p>
            <p className="text-3xl font-black text-[#33a333] mt-1">+{totalMonthScore}</p>
          </div>
          <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 border border-white/30 dark:border-white/5 text-center">
            <p className="text-[11px] text-gray-400 font-bold tracking-widest">日均得分</p>
            <p className="text-3xl font-black text-[var(--foreground)] mt-1">{activeDays > 0 ? Math.round(totalMonthScore / activeDays) : 0}</p>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[24px] p-8 border border-white/30 dark:border-white/5">
          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-3 mb-3">
            {WEEKDAY_NAMES.map(name => (
              <div key={name} className="text-center text-[11px] text-gray-400 font-bold">
                {name}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="space-y-3">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-3">
                {week.map((day, di) => {
                  const data = day ? dailyScores[day] : null;
                  const hasData = day !== null && data;
                  return (
                    <div
                      key={di}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-default group relative
                        ${day === null ? '' : 'hover:scale-110 hover:shadow-lg hover:z-10'}
                        ${hasData ? 'shadow-sm' : ''}
                      `}
                      style={{
                        backgroundColor: getHeatColor(day),
                      }}
                    >
                      {day !== null && (
                        <>
                          <span className={`text-[16px] font-black ${hasData && data.score >= 60 ? 'text-white' : hasData && data.score < 0 ? 'text-white' : 'text-[var(--foreground)]'}`}>
                            {day}
                          </span>
                          {hasData && (
                            <span className={`text-[9px] font-bold mt-0.5 ${data.score >= 60 ? 'text-white/80' : data.score < 0 ? 'text-white/80' : 'text-black/50 dark:text-white/50'}`}>
                              {data.score > 0 ? '+' : ''}{data.score}
                            </span>
                          )}
                        </>
                      )}

                      {/* Hover tooltip */}
                      {hasData && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                          {data.count}个时段 · {data.score}pts
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="text-[10px] text-gray-400 font-bold">低</span>
            {['var(--score-empty)', 'var(--score-1)', 'var(--score-2)', 'var(--score-3)', 'var(--score-4)'].map((color, i) => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-md"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[10px] text-gray-400 font-bold">高</span>
          </div>
        </div>
      </div>
    </div>
  );
}
