import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Score, type TimeBlock, type Tag, type UserSettings } from '@/types';

// Star-based energy: score IS the energy value directly
export const SCORE_ENERGY: Record<Score, number> = {
  "-1": -1,
  "0": 0,
  "0.25": 0.25,
  "0.5": 0.5,
  "0.75": 0.75,
  "1": 1,
};

export const SCORE_LABELS: Record<Score, string> = {
  "-1": "荒废内耗 ✕",
  "0": "空闲",
  "0.25": "¼★ 轻度维持",
  "0.5": "½★ 常规输出",
  "0.75": "¾★ 高效专注",
  "1": "★ 心流状态",
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

const DEFAULT_SETTINGS: UserSettings = {
  timeGranularity: 60,
  decimalPlaces: 1,
  theme: 'system',
};

interface TimeDataStore {
  blocks: Record<string, TimeBlock>;
  totalEnergy: number;
  tags: Tag[];
  settings: UserSettings;
  
  // Block Actions
  saveBlock: (dateStr: string, block: TimeBlock) => void;
  deleteBlock: (dateStr: string, hourId: number) => void;
  getBlock: (dateStr: string, hourId: number) => TimeBlock | undefined;
  getBlocksForDate: (dateStr: string) => TimeBlock[];
  getDayEnergy: (dateStr: string) => number;

  // Tag Actions
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  updateTag: (tag: Tag) => void;

  // Settings Actions
  updateSettings: (partial: Partial<UserSettings>) => void;

  // Data Actions
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
}

export const useTimeStore = create<TimeDataStore>()(
  persist(
    (set, get) => ({
      blocks: {
        // Monday - Mar 16
        "2026-03-16-7":  { id: "2026-03-16-7", dayOfWeek: 0, hourId: 7, score: 0.5, content: "早间晨读", tagId: "reading", status: "completed" },
        "2026-03-16-8":  { id: "2026-03-16-8", dayOfWeek: 0, hourId: 8, score: 0.75, content: "需求评审会议", tagId: "meeting", status: "completed" },
        "2026-03-16-9":  { id: "2026-03-16-9", dayOfWeek: 0, hourId: 9, score: 1, content: "核心模块重构", tagId: "deep-work", status: "completed" },
        "2026-03-16-10": { id: "2026-03-16-10", dayOfWeek: 0, hourId: 10, score: 1, content: "核心模块重构", tagId: "deep-work", status: "completed" },
        "2026-03-16-11": { id: "2026-03-16-11", dayOfWeek: 0, hourId: 11, score: 0.75, content: "代码审查", tagId: "deep-work", status: "completed" },
        "2026-03-16-12": { id: "2026-03-16-12", dayOfWeek: 0, hourId: 12, score: 0.25, content: "午休放松", tagId: "rest", status: "completed" },
        "2026-03-16-13": { id: "2026-03-16-13", dayOfWeek: 0, hourId: 13, score: -1, content: "刷手机", tagId: "entertainment", status: "completed" },
        "2026-03-16-14": { id: "2026-03-16-14", dayOfWeek: 0, hourId: 14, score: 0.75, content: "学习 Zustand", tagId: "study", status: "completed" },
        "2026-03-16-15": { id: "2026-03-16-15", dayOfWeek: 0, hourId: 15, score: 0.5, content: "文档整理", tagId: "deep-work", status: "completed" },
        "2026-03-16-16": { id: "2026-03-16-16", dayOfWeek: 0, hourId: 16, score: 0.25, content: "跑步 40 分钟", tagId: "exercise", status: "completed" },
        "2026-03-16-17": { id: "2026-03-16-17", dayOfWeek: 0, hourId: 17, score: 0.5, content: "技术博客写作", tagId: "creative", status: "completed" },

        // Tuesday - Mar 17
        "2026-03-17-8":  { id: "2026-03-17-8", dayOfWeek: 1, hourId: 8, score: 0.5, content: "站会同步进度", tagId: "meeting", status: "completed" },
        "2026-03-17-9":  { id: "2026-03-17-9", dayOfWeek: 1, hourId: 9, score: 1, content: "API 接口开发", tagId: "deep-work", status: "completed" },
        "2026-03-17-10": { id: "2026-03-17-10", dayOfWeek: 1, hourId: 10, score: 1, content: "API 接口开发", tagId: "deep-work", status: "completed" },
        "2026-03-17-11": { id: "2026-03-17-11", dayOfWeek: 1, hourId: 11, score: 0.75, content: "单元测试编写", tagId: "deep-work", status: "completed" },
        "2026-03-17-14": { id: "2026-03-17-14", dayOfWeek: 1, hourId: 14, score: 0.75, content: "React 高级模式学习", tagId: "study", status: "completed" },
        "2026-03-17-15": { id: "2026-03-17-15", dayOfWeek: 1, hourId: 15, score: 0.5, content: "小组讨论", tagId: "meeting", status: "completed" },
        "2026-03-17-16": { id: "2026-03-17-16", dayOfWeek: 1, hourId: 16, score: -1, content: "刷短视频", tagId: "entertainment", status: "completed" },
        "2026-03-17-18": { id: "2026-03-17-18", dayOfWeek: 1, hourId: 18, score: 0.5, content: "阅读《原则》", tagId: "reading", status: "completed" },

        // Wednesday - Mar 18
        "2026-03-18-9":  { id: "2026-03-18-9", dayOfWeek: 2, hourId: 9, score: 0.75, content: "数据库优化", tagId: "deep-work", status: "completed" },
        "2026-03-18-10": { id: "2026-03-18-10", dayOfWeek: 2, hourId: 10, score: 1, content: "数据库优化", tagId: "deep-work", status: "completed" },
        "2026-03-18-11": { id: "2026-03-18-11", dayOfWeek: 2, hourId: 11, score: 0.5, content: "需求文档阅读", tagId: "study", status: "completed" },
        "2026-03-18-14": { id: "2026-03-18-14", dayOfWeek: 2, hourId: 14, score: 0.75, content: "前端页面开发", tagId: "deep-work", status: "completed" },
        "2026-03-18-15": { id: "2026-03-18-15", dayOfWeek: 2, hourId: 15, score: 0.25, content: "健身房力量训练", tagId: "exercise", status: "completed" },
        "2026-03-18-19": { id: "2026-03-18-19", dayOfWeek: 2, hourId: 19, score: 0.5, content: "阅读技术文章", tagId: "reading", status: "completed" },

        // Thursday - Mar 19
        "2026-03-19-8":  { id: "2026-03-19-8", dayOfWeek: 3, hourId: 8, score: 0.75, content: "绘制架构图", tagId: "creative", status: "completed" },
        "2026-03-19-9":  { id: "2026-03-19-9", dayOfWeek: 3, hourId: 9, score: 1, content: "核心算法优化", tagId: "deep-work", status: "completed" },
        "2026-03-19-10": { id: "2026-03-19-10", dayOfWeek: 3, hourId: 10, score: 0.75, content: "核心算法优化", tagId: "deep-work", status: "completed" },
        "2026-03-19-14": { id: "2026-03-19-14", dayOfWeek: 3, hourId: 14, score: 0.5, content: "周报整理", tagId: "deep-work", status: "completed" },
        "2026-03-19-17": { id: "2026-03-19-17", dayOfWeek: 3, hourId: 17, score: 0.25, content: "瑜伽放松", tagId: "exercise", status: "completed" },

        // Friday - Mar 20 (today in the mock) - mix of completed + planned
        "2026-03-20-9":  { id: "2026-03-20-9", dayOfWeek: 4, hourId: 9, score: 0.75, content: "Sprint 回顾", tagId: "meeting", status: "completed" },
        "2026-03-20-10": { id: "2026-03-20-10", dayOfWeek: 4, hourId: 10, score: 0.5, content: "文档归档", tagId: "deep-work", status: "completed" },
        "2026-03-20-14": { id: "2026-03-20-14", dayOfWeek: 4, hourId: 14, score: 0, content: "深度工作：优化首页性能", tagId: "deep-work", status: "planned" },
        "2026-03-20-15": { id: "2026-03-20-15", dayOfWeek: 4, hourId: 15, score: 0, content: "学习 TypeScript 泛型", tagId: "study", status: "planned" },
        "2026-03-20-16": { id: "2026-03-20-16", dayOfWeek: 4, hourId: 16, score: 0, content: "跑步 5 公里", tagId: "exercise", status: "planned" },
        "2026-03-20-18": { id: "2026-03-20-18", dayOfWeek: 4, hourId: 18, score: 0, content: "个人项目开发", tagId: "creative", status: "planned" },

        // Saturday - Mar 21 (future - all planned)
        "2026-03-21-10": { id: "2026-03-21-10", dayOfWeek: 5, hourId: 10, score: 0, content: "阅读《人类简史》", tagId: "reading", status: "planned" },
        "2026-03-21-11": { id: "2026-03-21-11", dayOfWeek: 5, hourId: 11, score: 0, content: "户外散步", tagId: "exercise", status: "planned" },
        "2026-03-21-15": { id: "2026-03-21-15", dayOfWeek: 5, hourId: 15, score: 0, content: "Side Project 开发", tagId: "creative", status: "planned" },
        "2026-03-21-16": { id: "2026-03-21-16", dayOfWeek: 5, hourId: 16, score: 0, content: "Side Project 开发", tagId: "creative", status: "planned" },

        // Sunday - Mar 22 (future - planned)
        "2026-03-22-10": { id: "2026-03-22-10", dayOfWeek: 6, hourId: 10, score: 0, content: "整理本周笔记", tagId: "study", status: "planned" },
        "2026-03-22-14": { id: "2026-03-22-14", dayOfWeek: 6, hourId: 14, score: 0, content: "下周计划制定", tagId: "deep-work", status: "planned" },
        "2026-03-22-15": { id: "2026-03-22-15", dayOfWeek: 6, hourId: 15, score: 0, content: "阅读《原子习惯》", tagId: "reading", status: "planned" },
      },
      totalEnergy: 0, // Will be auto-calculated
      tags: DEFAULT_TAGS,
      settings: DEFAULT_SETTINGS,

      saveBlock: (dateStr, newBlock) => {
        set((state) => {
          const key = `${dateStr}-${newBlock.hourId}`;
          const existingBlock = state.blocks[key];
          
          const oldEnergy = existingBlock && existingBlock.status === 'completed' ? SCORE_ENERGY[existingBlock.score] : 0;
          const newEnergy = newBlock.status === 'completed' ? SCORE_ENERGY[newBlock.score] : 0;
          const energyDiff = newEnergy - oldEnergy;

          return {
            blocks: {
              ...state.blocks,
              [key]: { ...newBlock, id: key }
            },
            totalEnergy: state.totalEnergy + energyDiff
          };
        });
      },

      deleteBlock: (dateStr, hourId) => {
        set((state) => {
          const key = `${dateStr}-${hourId}`;
          const existingBlock = state.blocks[key];
          if (!existingBlock) return state;

          const oldEnergy = existingBlock.status === 'completed' ? SCORE_ENERGY[existingBlock.score] : 0;
          const nextBlocks = { ...state.blocks };
          delete nextBlocks[key];

          return {
            blocks: nextBlocks,
            totalEnergy: state.totalEnergy - oldEnergy
          };
        });
      },

      getBlock: (dateStr, hourId) => {
        return get().blocks[`${dateStr}-${hourId}`];
      },

      getBlocksForDate: (dateStr) => {
        const allBlocks = get().blocks;
        return Object.keys(allBlocks)
          .filter(key => key.startsWith(dateStr))
          .map(key => allBlocks[key]);
      },

      getDayEnergy: (dateStr) => {
        const dayBlocks = get().getBlocksForDate(dateStr);
        return dayBlocks
          .filter(b => b.status === 'completed')
          .reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
      },

      // Tag Management
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      removeTag: (id) => set((state) => ({ tags: state.tags.filter(t => t.id !== id) })),
      updateTag: (tag) => set((state) => ({
        tags: state.tags.map(t => t.id === tag.id ? tag : t)
      })),

      // Settings
      updateSettings: (partial) => set((state) => ({
        settings: { ...state.settings, ...partial }
      })),

      // Data Import/Export
      exportData: () => {
        const { blocks, tags, settings } = get();
        return JSON.stringify({ blocks, tags, settings, exportedAt: new Date().toISOString() }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.blocks) {
            set({
              blocks: data.blocks,
              tags: data.tags || DEFAULT_TAGS,
              settings: { ...DEFAULT_SETTINGS, ...data.settings },
            });
            // Recalculate energy
            const total = Object.values(data.blocks as Record<string, TimeBlock>)
              .filter((b) => b.status === 'completed')
              .reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
            set({ totalEnergy: total });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      clearAllData: () => set({
        blocks: {},
        totalEnergy: 0,
        tags: DEFAULT_TAGS,
        settings: DEFAULT_SETTINGS,
      }),
    }),
    {
      name: 'time-lens-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const total = Object.values(state.blocks)
            .filter(b => b.status === 'completed')
            .reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
          state.totalEnergy = total;
        }
      }
    }
  )
);
