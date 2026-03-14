"use client";

import { useTimeStore, SCORE_POINTS, DEFAULT_TAGS } from "@/store/timeStore";
import { Flame, TrendingUp, Clock, Zap, Award, Target } from "lucide-react";

// Date range for our mock week
const WEEK_DATES = [
  "2026-03-16", "2026-03-17", "2026-03-18",
  "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22"
];
const DAY_NAMES = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default function DashboardPage() {
  const { blocks, totalPoints, tags } = useTimeStore();

  // --- Derived Analytics ---

  // 1. Daily scores
  const dailyScores = WEEK_DATES.map(date => {
    const dayBlocks = Object.keys(blocks)
      .filter(key => key.startsWith(date))
      .map(key => blocks[key]);
    const score = dayBlocks.reduce((acc, b) => acc + SCORE_POINTS[b.score], 0);
    const count = dayBlocks.length;
    return { date, score, count };
  });
  const maxDailyScore = Math.max(...dailyScores.map(d => Math.abs(d.score)), 1);

  // 2. Tag distribution
  const tagCounts: Record<string, number> = {};
  Object.values(blocks).forEach(block => {
    if (block.tagId) {
      tagCounts[block.tagId] = (tagCounts[block.tagId] || 0) + 1;
    }
  });
  const totalTagged = Object.values(tagCounts).reduce((a, b) => a + b, 0);

  // 3. Hourly heatmap (which hours are most productive)
  const hourlyScores: number[] = Array(24).fill(0);
  const hourlyCounts: number[] = Array(24).fill(0);
  Object.values(blocks).forEach(block => {
    hourlyScores[block.hourId] += SCORE_POINTS[block.score];
    hourlyCounts[block.hourId] += 1;
  });
  const bestHour = hourlyScores.indexOf(Math.max(...hourlyScores));
  const maxHourlyScore = Math.max(...hourlyScores, 1);

  // 4. Streak calculation (consecutive days with positive score)
  let currentStreak = 0;
  for (let i = dailyScores.length - 1; i >= 0; i--) {
    if (dailyScores[i].score > 0) currentStreak++;
    else break;
  }

  // 5. Best day
  const bestDayIdx = dailyScores.reduce((best, curr, idx) => 
    curr.score > dailyScores[best].score ? idx : best, 0);

  // 6. Total blocks recorded
  const totalBlocks = Object.keys(blocks).length;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-5 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-[22px] font-bold tracking-tight">数据洞察</h1>
        <p className="text-[13px] text-gray-400 mt-1.5 font-medium">2026年3月16日 - 3月22日 · 一周数据概览</p>
      </header>

      <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto w-full">

        {/* --- Row 1: Summary Cards --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard icon={<Zap size={20} />} label="总能量值" value={`${totalPoints}`} accent="#33a333" />
          <SummaryCard icon={<Flame size={20} />} label="连续打卡" value={`${currentStreak} 天`} accent="#f59e0b" />
          <SummaryCard icon={<Target size={20} />} label="已记录时段" value={`${totalBlocks}`} accent="#2563eb" />
          <SummaryCard icon={<Award size={20} />} label="最佳日" value={DAY_NAMES[bestDayIdx]} accent="#7c3aed" />
        </div>

        {/* --- Row 2: Weekly Bar Chart + Tag Donut --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Weekly Score Chart */}
          <div className="lg:col-span-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-6 border border-white/30 dark:border-white/5">
            <h2 className="text-[16px] font-bold mb-1 tracking-tight">能量值走势</h2>
            <p className="text-[12px] text-gray-400 font-medium mb-6">本周每日累计得分</p>
            
            <div className="flex items-end justify-between gap-3 h-44">
              {dailyScores.map((day, i) => {
                const height = Math.abs(day.score) / maxDailyScore * 100;
                const isNegative = day.score < 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-[13px] font-black ${isNegative ? 'text-red-500' : 'text-[#33a333]'}`}>
                      {day.score > 0 ? '+' : ''}{day.score}
                    </span>
                    <div className="w-full flex justify-center">
                      <div 
                        className={`w-full max-w-[48px] rounded-xl transition-all duration-500 ${isNegative ? 'bg-red-400/40' : 'bg-gradient-to-t from-[#33a333] to-[#5dd65d]'}`}
                        style={{ height: `${Math.max(height, 8)}%`, minHeight: '12px' }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold">{DAY_NAMES[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tag Distribution */}
          <div className="lg:col-span-2 bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-6 border border-white/30 dark:border-white/5">
            <h2 className="text-[16px] font-bold mb-1 tracking-tight">时间投资分布</h2>
            <p className="text-[12px] text-gray-400 font-medium mb-5">按活动标签归类</p>
            
            <div className="space-y-3">
              {DEFAULT_TAGS
                .filter(tag => tagCounts[tag.id])
                .sort((a, b) => (tagCounts[b.id] || 0) - (tagCounts[a.id] || 0))
                .map(tag => {
                  const count = tagCounts[tag.id] || 0;
                  const pct = totalTagged > 0 ? Math.round((count / totalTagged) * 100) : 0;
                  return (
                    <div key={tag.id} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{tag.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[13px] font-bold">{tag.name}</span>
                          <span className="text-[11px] text-gray-400 font-semibold">{count}h · {pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: tag.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* --- Row 3: Hourly Productivity Heatmap --- */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-6 border border-white/30 dark:border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold tracking-tight flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                黄金时段分析
              </h2>
              <p className="text-[12px] text-gray-400 font-medium mt-1">你在 <span className="font-bold text-[var(--foreground)]">{bestHour}:00</span> 时段的产出最高</p>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: 24 }, (_, i) => {
              const score = hourlyScores[i];
              const opacity = maxHourlyScore > 0 ? Math.max(score / maxHourlyScore, 0) : 0;
              const isActive = hourlyCounts[i] > 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-full aspect-square rounded-lg transition-all duration-500 ${!isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    style={isActive ? { 
                      backgroundColor: score >= 0 
                        ? `rgba(51, 163, 51, ${0.15 + opacity * 0.85})`
                        : `rgba(239, 68, 68, ${0.3})`,
                    } : {}}
                    title={`${i}:00 - ${i+1}:00: ${score} pts`}
                  />
                  {i % 2 === 0 && (
                    <span className="text-[9px] text-gray-400 font-mono font-bold">{i.toString().padStart(2,'0')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Row 4: Streaks & Achievements --- */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-6 border border-white/30 dark:border-white/5">
          <h2 className="text-[16px] font-bold mb-4 tracking-tight flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-400" />
            成就与里程碑
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AchievementBadge 
              emoji="🔥" 
              title={`${currentStreak} 天连续正分`}
              desc="保持每天正向产出"
              unlocked={currentStreak >= 3}
            />
            <AchievementBadge 
              emoji="💎" 
              title="心流达人"
              desc="单日累计超过 100pts"
              unlocked={dailyScores.some(d => d.score >= 100)}
            />
            <AchievementBadge 
              emoji="🌿"
              title="全勤周"
              desc="7天连续记录"
              unlocked={dailyScores.every(d => d.count > 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-5 border border-white/30 dark:border-white/5 flex flex-col gap-3 hover:scale-[1.02] transition-transform cursor-default">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-gray-400 font-bold tracking-wider">{label}</p>
        <p className="text-[22px] font-black tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AchievementBadge({ emoji, title, desc, unlocked }: { emoji: string; title: string; desc: string; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
      unlocked 
        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 shadow-sm' 
        : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700/50 opacity-50 grayscale'
    }`}>
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="text-[14px] font-bold">{title}</p>
        <p className="text-[11px] text-gray-400 font-medium">{desc}</p>
      </div>
    </div>
  );
}
