import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Score, type TimeBlock, type Tag, type UserSettings } from '@/types';

export const SCORE_ENERGY: Record<Score, number> = {
  "-1": -1,
  "0": 0,
  "0.25": 0.25,
  "0.5": 0.5,
  "0.75": 0.75,
  "1": 1,
};

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
  theme: 'light',
  hideSleepTime: true,
  primaryColor: 'amber',
  cloudSyncEnabled: false, // 默认关闭云端同步，用户主动开启
};

interface TimeDataStore {
  blocks: Record<string, TimeBlock>;
  totalEnergy: number;
  tags: Tag[];
  settings: UserSettings;
  
  saveBlock: (dateStr: string, block: TimeBlock) => void;
  deleteBlock: (dateStr: string, blockId: string) => void;
  getBlock: (dateStr: string, hourId: number | string) => TimeBlock | undefined;
  getBlocksForDate: (dateStr: string) => TimeBlock[];
  getDayEnergy: (dateStr: string) => number;

  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  updateTag: (tag: Tag) => void;

  updateSettings: (partial: Partial<UserSettings>) => void;
  toggleTheme: () => void;

  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
  
  // 云端同步相关
  isSyncing: boolean;
  lastSyncedAt: string | null;
  setSyncStatus: (status: boolean) => void;
  setLastSyncedAt: (at: string) => void;
}

export const useTimeStore = create<TimeDataStore>()(
  persist(
    (set, get) => ({
      blocks: {}, // Start fresh for V5 demo or keep persisting
      totalEnergy: 0,
      tags: DEFAULT_TAGS,
      settings: DEFAULT_SETTINGS,
      isSyncing: false,
      lastSyncedAt: null,

      setSyncStatus: (status) => set({ isSyncing: status }),
      setLastSyncedAt: (at) => set({ lastSyncedAt: at }),

      saveBlock: (dateStr, newBlock) => {
        set((state) => {
          const key = newBlock.id.startsWith(dateStr) ? newBlock.id : `${dateStr}-${newBlock.id}`;
          const existingBlock = state.blocks[key];
          
          const oldEnergy = (existingBlock && existingBlock.status === 'completed') ? SCORE_ENERGY[existingBlock.score] : 0;
          const newEnergy = (newBlock.status === 'completed') ? SCORE_ENERGY[newBlock.score] : 0;
          const energyDiff = newEnergy - oldEnergy;

          return {
            blocks: { ...state.blocks, [key]: newBlock },
            totalEnergy: state.totalEnergy + energyDiff
          };
        });
      },

      deleteBlock: (dateStr, blockId) => {
        set((state) => {
          const key = blockId.startsWith(dateStr) ? blockId : `${dateStr}-${blockId}`;
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
        const key = typeof hourId === 'number' ? `${dateStr}-${hourId}` : hourId;
        return get().blocks[key];
      },

      getBlocksForDate: (dateStr) => {
        const allBlocks = get().blocks;
        return Object.keys(allBlocks)
          .filter(key => key.startsWith(dateStr))
          .map(key => allBlocks[key]);
      },

      getDayEnergy: (dateStr) => {
        return get().getBlocksForDate(dateStr)
          .filter(b => b.status === 'completed')
          .reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
      },

      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      removeTag: (id) => set((state) => ({ tags: state.tags.filter(t => t.id !== id) })),
      updateTag: (tag) => set((state) => ({
        tags: state.tags.map(t => t.id === tag.id ? tag : t)
      })),

      updateSettings: (partial) => set((state) => ({
        settings: { ...state.settings, ...partial }
      })),

      toggleTheme: () => set((state) => ({
        settings: { ...state.settings, theme: state.settings.theme === 'light' ? 'dark' : 'light' }
      })),

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
            const total = Object.values(data.blocks as Record<string, TimeBlock>)
              .filter(b => b.status === 'completed')
              .reduce((acc, b) => acc + SCORE_ENERGY[b.score], 0);
            set({ totalEnergy: total });
            return true;
          }
          return false;
        } catch { return false; }
      },

      clearAllData: () => set({ blocks: {}, totalEnergy: 0, tags: DEFAULT_TAGS, settings: DEFAULT_SETTINGS }),
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
