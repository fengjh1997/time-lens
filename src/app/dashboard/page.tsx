"use client";

import { useTimeStore, SCORE_ENERGY, DEFAULT_TAGS } from "@/store/timeStore";
import { EnergyDisplay } from "@/components/ui/StarRating";
import { Flame, TrendingUp, Clock, Zap, Award, Target } from "lucide-react";

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
    else break;
  }

  const bestDayIdx = dailyScores.reduce((best, curr, idx) => 
    curr.energy > dailyScores[best].energy ? idx : best, 0);

  const totalBlocks = Object.values(blocks).filter(b => b.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-28 sm:pb-8">
      <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight">数据洞察</h1>
        <p className="text-[12px] sm:text-[13px] text-gray-400 mt-1 font-medium">2026年3月16日 - 3月22日 · 一周数据概览</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 space-y-5 sm:space-y-8 max-w-5xl mx-auto w-full">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard icon={<Zap size={18} />} label="总能量值" value={<EnergyDisplay value={totalEnergy} decimals={settings.decimalPlaces} />} accent="#f59e0b" />
          <SummaryCard icon={<Flame size={18} />} label="连续打卡" value={`${currentStreak} 天`} accent="#ef4444" />
          <SummaryCard icon={<Target size={18} />} label="已完成" value={`${totalBlocks}`} accent="#2563eb" />
          <SummaryCard icon={<Award size={18} />} label="最佳日" value={DAY_NAMES[bestDayIdx]} accent="#7c3aed" />
        </div>

        {/* Chart + Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-5 sm:p-6 border border-white/30 dark:border-white/5">
            <h2 className="text-[15px] sm:text-[16px] font-bold mb-1">能量值走势</h2>
            <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium mb-5 sm:mb-6">本周每日累计能量</p>
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-36 sm:h-44">
              {dailyScores.map((day, i) => {
                const height = Math.abs(day.energy) / maxDailyEnergy * 100;
                const isNeg = day.energy < 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2">
                    <span className={`text-[11px] sm:text-[13px] font-black ${isNeg ? 'text-red-500' : 'text-amber-500'}`}>
                      {day.energy > 0 ? '+' : ''}{day.energy.toFixed(settings.decimalPlaces)}
                    </span>
                    <div className="w-full flex justify-center">
                      <div 
                        className={`w-full max-w-[48px] rounded-xl transition-all duration-500 ${isNeg ? 'bg-red-400/40' : 'bg-gradient-to-t from-amber-500 to-amber-300'}`}
                        style={{ height: `${Math.max(height, 8)}%`, minHeight: '12px' }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold">{DAY_NAMES[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-5 sm:p-6 border border-white/30 dark:border-white/5">
            <h2 className="text-[15px] sm:text-[16px] font-bold mb-1">时间投资分布</h2>
            <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium mb-4 sm:mb-5">按标签归类</p>
            <div className="space-y-3">
              {tags
                .filter(tag => tagCounts[tag.id])
                .sort((a, b) => (tagCounts[b.id] || 0) - (tagCounts[a.id] || 0))
                .map(tag => {
                  const count = tagCounts[tag.id] || 0;
                  const pct = totalTagged > 0 ? Math.round((count / totalTagged) * 100) : 0;
                  return (
                    <div key={tag.id} className="flex items-center gap-3">
                      <span className="text-base sm:text-lg w-6 sm:w-7 text-center">{tag.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] sm:text-[13px] font-bold">{tag.name}</span>
                          <span className="text-[10px] sm:text-[11px] text-gray-400 font-semibold">{count}h · {pct}%</span>
                        </div>
                        <div className="w-full h-2 sm:h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: tag.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Hourly Heatmap */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-5 sm:p-6 border border-white/30 dark:border-white/5">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-bold flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                黄金时段分析
              </h2>
              <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium mt-1">
                你在 <span className="font-bold text-[var(--foreground)]">{bestHour}:00</span> 的产出最高
              </p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
            {Array.from({ length: 24 }, (_, i) => {
              const e = hourlyEnergy[i];
              const opacity = maxHourlyEnergy > 0 ? Math.max(e / maxHourlyEnergy, 0) : 0;
              const isActive = hourlyCounts[i] > 0;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <div 
                    className={`w-full aspect-square rounded-md sm:rounded-lg transition-all ${!isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    style={isActive ? { 
                      backgroundColor: e >= 0 
                        ? `rgba(245, 158, 11, ${0.15 + opacity * 0.85})`
                        : `rgba(239, 68, 68, 0.3)`,
                    } : {}}
                    title={`${i}:00: ${e.toFixed(1)}★`}
                  />
                  {i % 3 === 0 && (
                    <span className="text-[8px] sm:text-[9px] text-gray-400 font-mono font-bold">{i.toString().padStart(2,'0')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-5 sm:p-6 border border-white/30 dark:border-white/5">
          <h2 className="text-[15px] sm:text-[16px] font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" />
            成就与里程碑
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <AchievementBadge emoji="🔥" title={`${currentStreak} 天连续正分`} desc="保持每天正向产出" unlocked={currentStreak >= 3} />
            <AchievementBadge emoji="⭐" title="心流达人" desc="单日累计超过 5★" unlocked={dailyScores.some(d => d.energy >= 5)} />
            <AchievementBadge emoji="🌿" title="全勤周" desc="7 天连续记录" unlocked={dailyScores.every(d => d.count > 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-4 sm:p-5 border border-white/30 dark:border-white/5 flex flex-col gap-2.5 sm:gap-3 hover:scale-[1.02] transition-transform">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] sm:text-[12px] text-gray-400 font-bold tracking-wider">{label}</p>
        <p className="text-xl sm:text-[22px] font-black tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AchievementBadge({ emoji, title, desc, unlocked }: { emoji: string; title: string; desc: string; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${
      unlocked 
        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 shadow-sm' 
        : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700/50 opacity-50 grayscale'
    }`}>
      <span className="text-2xl sm:text-3xl">{emoji}</span>
      <div>
        <p className="text-[13px] sm:text-[14px] font-bold">{title}</p>
        <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">{desc}</p>
      </div>
    </div>
  );
}
