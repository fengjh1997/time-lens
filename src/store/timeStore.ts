import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Score, type TimeBlock, type Tag } from '@/types';

// Points Dictionary based on Gamification Design
export const SCORE_POINTS: Record<Score, number> = {
  "-1": -10,
  "0": 0,
  "1": 10,
  "2": 20,
  "3": 30,
  "4": 40,
};

// Default Tags
export const DEFAULT_TAGS: Tag[] = [
  { id: "deep-work", name: "深度工作", emoji: "💻", color: "#2563eb" },
  { id: "study", name: "学习", emoji: "📚", color: "#7c3aed" },
  { id: "exercise", name: "运动", emoji: "🏃", color: "#059669" },
  { id: "reading", name: "阅读", emoji: "📖", color: "#d97706" },
  { id: "meeting", name: "会议", emoji: "🤝", color: "#dc2626" },
  { id: "creative", name: "创作", emoji: "🎨", color: "#ec4899" },
  { id: "rest", name: "休息", emoji: "😴", color: "#6b7280" },
  { id: "entertainment", name: "娱乐放松", emoji: "🎮", color: "#f59e0b" },
];

interface TimeDataStore {
  // blockId: "YYYY-MM-DD-hourId"
  blocks: Record<string, TimeBlock>;
  totalPoints: number;
  tags: Tag[];
  
  // Actions
  saveBlock: (dateStr: string, block: TimeBlock) => void;
  deleteBlock: (dateStr: string, hourId: number) => void;
  getBlock: (dateStr: string, hourId: number) => TimeBlock | undefined;
  getBlocksForDate: (dateStr: string) => TimeBlock[];
  getDayScore: (dateStr: string) => number;
}

export const useTimeStore = create<TimeDataStore>()(
  persist(
    (set, get) => ({
      blocks: {
        // Monday - Mar 16
        "2026-03-16-7":  { id: "2026-03-16-7", dayOfWeek: 0, hourId: 7, score: 2, content: "早间晨读", tagId: "reading" },
        "2026-03-16-8":  { id: "2026-03-16-8", dayOfWeek: 0, hourId: 8, score: 3, content: "需求评审会议", tagId: "meeting" },
        "2026-03-16-9":  { id: "2026-03-16-9", dayOfWeek: 0, hourId: 9, score: 4, content: "核心模块重构", tagId: "deep-work" },
        "2026-03-16-10": { id: "2026-03-16-10", dayOfWeek: 0, hourId: 10, score: 4, content: "核心模块重构", tagId: "deep-work" },
        "2026-03-16-11": { id: "2026-03-16-11", dayOfWeek: 0, hourId: 11, score: 3, content: "代码审查", tagId: "deep-work" },
        "2026-03-16-12": { id: "2026-03-16-12", dayOfWeek: 0, hourId: 12, score: 1, content: "午休放松", tagId: "rest" },
        "2026-03-16-13": { id: "2026-03-16-13", dayOfWeek: 0, hourId: 13, score: -1, content: "刷手机", tagId: "entertainment" },
        "2026-03-16-14": { id: "2026-03-16-14", dayOfWeek: 0, hourId: 14, score: 3, content: "学习 Zustand", tagId: "study" },
        "2026-03-16-15": { id: "2026-03-16-15", dayOfWeek: 0, hourId: 15, score: 2, content: "文档整理", tagId: "deep-work" },
        "2026-03-16-16": { id: "2026-03-16-16", dayOfWeek: 0, hourId: 16, score: 1, content: "跑步 40 分钟", tagId: "exercise" },
        "2026-03-16-17": { id: "2026-03-16-17", dayOfWeek: 0, hourId: 17, score: 2, content: "技术博客写作", tagId: "creative" },

        // Tuesday - Mar 17
        "2026-03-17-8":  { id: "2026-03-17-8", dayOfWeek: 1, hourId: 8, score: 2, content: "站会同步进度", tagId: "meeting" },
        "2026-03-17-9":  { id: "2026-03-17-9", dayOfWeek: 1, hourId: 9, score: 4, content: "API 接口开发", tagId: "deep-work" },
        "2026-03-17-10": { id: "2026-03-17-10", dayOfWeek: 1, hourId: 10, score: 4, content: "API 接口开发", tagId: "deep-work" },
        "2026-03-17-11": { id: "2026-03-17-11", dayOfWeek: 1, hourId: 11, score: 3, content: "单元测试编写", tagId: "deep-work" },
        "2026-03-17-14": { id: "2026-03-17-14", dayOfWeek: 1, hourId: 14, score: 3, content: "React 高级模式学习", tagId: "study" },
        "2026-03-17-15": { id: "2026-03-17-15", dayOfWeek: 1, hourId: 15, score: 2, content: "小组讨论", tagId: "meeting" },
        "2026-03-17-16": { id: "2026-03-17-16", dayOfWeek: 1, hourId: 16, score: -1, content: "刷短视频", tagId: "entertainment" },
        "2026-03-17-18": { id: "2026-03-17-18", dayOfWeek: 1, hourId: 18, score: 2, content: "阅读《原则》", tagId: "reading" },

        // Wednesday - Mar 18
        "2026-03-18-9":  { id: "2026-03-18-9", dayOfWeek: 2, hourId: 9, score: 3, content: "数据库优化", tagId: "deep-work" },
        "2026-03-18-10": { id: "2026-03-18-10", dayOfWeek: 2, hourId: 10, score: 4, content: "数据库优化", tagId: "deep-work" },
        "2026-03-18-11": { id: "2026-03-18-11", dayOfWeek: 2, hourId: 11, score: 2, content: "需求文档阅读", tagId: "study" },
        "2026-03-18-14": { id: "2026-03-18-14", dayOfWeek: 2, hourId: 14, score: 3, content: "前端页面开发", tagId: "deep-work" },
        "2026-03-18-15": { id: "2026-03-18-15", dayOfWeek: 2, hourId: 15, score: 1, content: "健身房力量训练", tagId: "exercise" },
        "2026-03-18-19": { id: "2026-03-18-19", dayOfWeek: 2, hourId: 19, score: 2, content: "阅读技术文章", tagId: "reading" },

        // Thursday - Mar 19
        "2026-03-19-8":  { id: "2026-03-19-8", dayOfWeek: 3, hourId: 8, score: 3, content: "绘制架构图", tagId: "creative" },
        "2026-03-19-9":  { id: "2026-03-19-9", dayOfWeek: 3, hourId: 9, score: 4, content: "核心算法优化", tagId: "deep-work" },
        "2026-03-19-10": { id: "2026-03-19-10", dayOfWeek: 3, hourId: 10, score: 3, content: "核心算法优化", tagId: "deep-work" },
        "2026-03-19-14": { id: "2026-03-19-14", dayOfWeek: 3, hourId: 14, score: 2, content: "周报整理", tagId: "deep-work" },
        "2026-03-19-17": { id: "2026-03-19-17", dayOfWeek: 3, hourId: 17, score: 1, content: "瑜伽放松", tagId: "exercise" },

        // Friday - Mar 20
        "2026-03-20-9":  { id: "2026-03-20-9", dayOfWeek: 4, hourId: 9, score: 3, content: "Sprint 回顾", tagId: "meeting" },
        "2026-03-20-10": { id: "2026-03-20-10", dayOfWeek: 4, hourId: 10, score: 2, content: "文档归档", tagId: "deep-work" },
        "2026-03-20-14": { id: "2026-03-20-14", dayOfWeek: 4, hourId: 14, score: -1, content: "打游戏摸鱼", tagId: "entertainment" },
        "2026-03-20-15": { id: "2026-03-20-15", dayOfWeek: 4, hourId: 15, score: 2, content: "学习 TypeScript", tagId: "study" },
        "2026-03-20-18": { id: "2026-03-20-18", dayOfWeek: 4, hourId: 18, score: 3, content: "个人项目开发", tagId: "creative" },

        // Saturday - Mar 21
        "2026-03-21-10": { id: "2026-03-21-10", dayOfWeek: 5, hourId: 10, score: 2, content: "阅读《人类简史》", tagId: "reading" },
        "2026-03-21-11": { id: "2026-03-21-11", dayOfWeek: 5, hourId: 11, score: 1, content: "轻度散步", tagId: "exercise" },
        "2026-03-21-15": { id: "2026-03-21-15", dayOfWeek: 5, hourId: 15, score: 3, content: "Side Project", tagId: "creative" },
        "2026-03-21-16": { id: "2026-03-21-16", dayOfWeek: 5, hourId: 16, score: 2, content: "Side Project", tagId: "creative" },

        // Sunday - Mar 22
        "2026-03-22-10": { id: "2026-03-22-10", dayOfWeek: 6, hourId: 10, score: -1, content: "赖床刷手机", tagId: "entertainment" },
        "2026-03-22-14": { id: "2026-03-22-14", dayOfWeek: 6, hourId: 14, score: 2, content: "下周计划制定", tagId: "deep-work" },
        "2026-03-22-15": { id: "2026-03-22-15", dayOfWeek: 6, hourId: 15, score: 3, content: "阅读《原子习惯》", tagId: "reading" },
      },
      totalPoints: 0, // Will be calculated on init
      tags: DEFAULT_TAGS,

      saveBlock: (dateStr, newBlock) => {
        set((state) => {
          const key = `${dateStr}-${newBlock.hourId}`;
          const existingBlock = state.blocks[key];
          
          // Calculate point difference
          const oldScorePts = existingBlock ? SCORE_POINTS[existingBlock.score] : 0;
          const newScorePts = SCORE_POINTS[newBlock.score];
          const pointDiff = newScorePts - oldScorePts;

          return {
            blocks: {
              ...state.blocks,
              [key]: { ...newBlock, id: key }
            },
            totalPoints: state.totalPoints + pointDiff
          };
        });
      },

      deleteBlock: (dateStr, hourId) => {
        set((state) => {
          const key = `${dateStr}-${hourId}`;
          const existingBlock = state.blocks[key];
          
          if (!existingBlock) return state;

          const oldScorePts = SCORE_POINTS[existingBlock.score];
          const nextBlocks = { ...state.blocks };
          delete nextBlocks[key];

          return {
            blocks: nextBlocks,
            totalPoints: state.totalPoints - oldScorePts
          };
        });
      },

      getBlock: (dateStr, hourId) => {
        const key = `${dateStr}-${hourId}`;
        return get().blocks[key];
      },

      getBlocksForDate: (dateStr) => {
        const allBlocks = get().blocks;
        return Object.keys(allBlocks)
          .filter(key => key.startsWith(dateStr))
          .map(key => allBlocks[key]);
      },

      getDayScore: (dateStr) => {
        const dayBlocks = get().getBlocksForDate(dateStr);
        return dayBlocks.reduce((acc, block) => acc + SCORE_POINTS[block.score], 0);
      },
    }),
    {
      name: 'time-lens-storage',
      onRehydrateStorage: () => (state) => {
        // Recalculate totalPoints on rehydration
        if (state) {
          const total = Object.values(state.blocks).reduce(
            (acc, block) => acc + SCORE_POINTS[block.score], 0
          );
          state.totalPoints = total;
        }
      }
    }
  )
);
