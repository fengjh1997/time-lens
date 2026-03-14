"use client";

import { useTimeStore, SCORE_ENERGY } from "@/store/timeStore";
import { EnergyDisplay } from "@/components/ui/StarRating";
import { Flame, TrendingUp, Clock, Zap, Award, Target } from "lucide-react";

// In a real app these would be dynamic based on current week
const WEEK_DATES = [
  "2026-03-16", "2026-03-17", "2026-03-18",
  "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"
];
const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function DashboardPage() {
  const { blocks, totalEnergy, tags, settings } = useTimeStore();

  // Daily energies
  const dailyScores = WEEK_DATES.map(date => {
    const dayBlocks = Object.keys(blocks)
      .filter(key => key.startsWith(date))
      .map(key => blocks[key])
      .filter(b => b.status === 'completed');
    const energy = dayBlocks.reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
    const count = dayBlocks.length;
    return { date, energy, count };
  });
  const maxDailyEnergy = Math.max(...dailyScores.map(d => Math.abs(d.energy)), 0.1);

  // Tag distribution
  const tagCounts: Record<string, number> = {};
  Object.values(blocks).filter(b => b.status === 'completed').forEach(block => {
    if (block.tagId) tagCounts[block.tagId] = (tagCounts[block.tagId] || 0) + 1;
  });
  const totalTagged = Object.values(tagCounts).reduce((a, b) => a + b, 0);

  // Hourly heat
  const hourlyEnergy: number[] = Array(24).fill(0);
  const hourlyCounts: number[] = Array(24).fill(0);
  Object.values(blocks).filter(b => b.status === 'completed').forEach(block => {
    hourlyEnergy[block.hourId] += SCORE_ENERGY[block.score];
    hourlyCounts[block.hourId] += 1;
  });
  const bestHour = hourlyEnergy.indexOf(Math.max(...hourlyEnergy));
  const maxHourlyEnergy = Math.max(...hourlyEnergy, 0.1);

  // Streak
  let currentStreak = 0;
  for (let i = dailyScores.length - 1; i >= 0; i--) {
    if (dailyScores[i].energy > 0) currentStreak++;
    else if (dailyScores[i].count === 0 && i === dailyScores.length - 1) continue; // skip today if empty
    else break;
  }

  const bestDayIdx = dailyScores.reduce((best, curr, idx) => 
    curr.energy > dailyScores[best].energy ? idx : best, 0);

  const totalBlocks = Object.values(blocks).filter(b => b.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-28 sm:pb-8">
      <header className="px-4 sm:px-8 py-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-20">
        <h1 className="text-[20px] sm:text-[24px] font-black tracking-tight">数据洞察</h1>
        <p className="text-[12px] text-gray-400 font-bold mt-1 tracking-widest uppercase">2026年3月 · 一周产出全分析</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-10 max-w-6xl mx-auto w-full">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <SummaryCard icon={<Zap size={22} />} label="总能量值" value={<EnergyDisplay value={totalEnergy} />} isPrimary />
          <SummaryCard icon={<Flame size={22} />} label="连续打卡" value={`${currentStreak} 天`} accent="#f43f5e" />
          <SummaryCard icon={<Target size={22} />} label="总记录数" value={`${totalBlocks} 个块`} accent="#10b981" />
          <SummaryCard icon={<Award size={22} />} label="本周最佳" value={DAY_NAMES[bestDayIdx]} accent="#8b5cf6" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Main Trend Chart */}
          <div className="lg:col-span-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-8 border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[17px] font-black">能量产出趋势</h2>
                <p className="text-[12px] text-gray-400 font-bold mt-1">本周每日累计星数</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 h-48 sm:h-56">
              {dailyScores.map((day, i) => {
                const height = Math.abs(day.energy) / maxDailyEnergy * 100;
                const isNeg = day.energy < 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-3">
                    <span className={`text-[12px] font-black ${isNeg ? 'text-red-500' : 'text-[var(--primary-color)]'}`}>
                      {day.energy > 0 ? '+' : ''}{day.energy.toFixed(1)}
                    </span>
                    <div className="w-full flex justify-center">
                      <div 
                        className={`w-full max-w-[42px] rounded-2xl transition-all duration-700 relative group
                          ${isNeg ? 'bg-red-400/30' : 'bg-gradient-to-t from-[var(--primary-color)] to-[var(--primary-color)]/60 shadow-lg shadow-[var(--primary-glow)]'}
                        `}
                        style={{ height: `${Math.max(height, 8)}%`, minHeight: '12px' }}
                      >
                         <div className="absolute inset-x-0 -top-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                            {day.count} 个记录
                         </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">{DAY_NAMES[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tag Distribution */}
          <div className="lg:col-span-2 bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-8 border border-[var(--border-color)]">
            <h2 className="text-[17px] font-black mb-1">时间投资矩阵</h2>
            <p className="text-[12px] text-gray-400 font-bold mb-8">按任务标签权重</p>
            <div className="space-y-6">
              {tags
                .filter(tag => tagCounts[tag.id])
                .sort((a, b) => (tagCounts[b.id] || 0) - (tagCounts[a.id] || 0))
                .map(tag => {
                  const count = tagCounts[tag.id] || 0;
                  const pct = totalTagged > 0 ? Math.round((count / totalTagged) * 100) : 0;
                  return (
                    <div key={tag.id} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                           <span className="text-xl">{tag.emoji}</span>
                           <span className="text-[13px] font-black">{tag.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-gray-400">{count}h · {pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 origin-left" 
                          style={{ width: `${pct}%`, backgroundColor: tag.color }} 
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Hourly Golden Hour Heatmap */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-8 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[17px] font-black flex items-center gap-2">
                <Clock size={18} className="text-[var(--primary-color)]" />
                黄金产出时段
              </h2>
              <p className="text-[12px] text-gray-400 font-bold mt-1">
                你在 <span className="text-[var(--primary-color)] font-black">{bestHour}:00</span> 表现最为卓越
              </p>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const e = hourlyEnergy[i];
              const opacity = maxHourlyEnergy > 0 ? Math.max(e / maxHourlyEnergy, 0) : 0;
              const isActive = hourlyCounts[i] > 0;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-full aspect-square rounded-[10px] transition-all hover:scale-110 
                      ${!isActive ? 'bg-black/[0.05] dark:bg-white/[0.05]' : 'shadow-lg shadow-[var(--primary-glow)]'}
                    `}
                    style={isActive ? { 
                      backgroundColor: e >= 0 
                        ? `rgba(var(--primary-rgb), ${0.2 + opacity * 0.8})`
                        : `rgb(244 63 94)`,
                    } : {}}
                    title={`${i}:00: ${e.toFixed(1)}★`}
                  />
                  {(i % 4 === 0) && (
                    <span className="text-[9px] text-gray-400 font-mono font-black">{i}:00</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 sm:p-8 border border-[var(--border-color)]">
           <h2 className="text-[17px] font-black mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--primary-color)]" />
            心流里程碑
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Achievement badge="🔥" title="势如破竹" desc={`${currentStreak}天连续记录`} unlocked={currentStreak >= 3} />
             <Achievement badge="⭐" title="能量爆表" desc="单日星级超过 5.0★" unlocked={dailyScores.some(d => d.energy >= 5)} />
             <Achievement badge="🏆" title="本周全勤" desc="记录了本周所有日期" unlocked={dailyScores.every(d => d.count > 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent, isPrimary }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string; isPrimary?: boolean }) {
  return (
    <div className={`rounded-[32px] p-6 border border-white/20 dark:border-white/5 flex flex-col gap-4 shadow-sm hover:translate-y-[-4px] transition-all active:scale-95 group
      ${isPrimary 
        ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/80 text-white shadow-xl shadow-[var(--primary-glow)] border-none' 
        : 'bg-black/[0.02] dark:bg-white/[0.02]'
      }
    `}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white
        ${isPrimary ? 'bg-white/20' : ''}
      `} style={!isPrimary ? { backgroundColor: accent } : {}}>
        {icon}
      </div>
      <div>
        <p className={`text-[12px] font-black uppercase tracking-wider ${isPrimary ? 'opacity-80' : 'text-gray-400'}`}>{label}</p>
        <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function Achievement({ badge, title, desc, unlocked }: { badge: string; title: string; desc: string; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-5 rounded-[24px] border transition-all duration-500
      ${unlocked 
        ? 'bg-[var(--primary-light)] border-[var(--primary-color)]/20 shadow-sm' 
        : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-40 grayscale'
      }
    `}>
      <span className="text-3xl">{badge}</span>
      <div>
        <p className={`text-[14px] font-black ${unlocked ? 'text-[var(--foreground)]' : 'text-gray-500'}`}>{title}</p>
        <p className="text-[11px] font-bold text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
