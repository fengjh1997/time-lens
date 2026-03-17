import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Score, type Tag, type TimeBlock, type UserSettings } from "@/types";

export const SCORE_ENERGY: Record<Score, number> = {
  "-1": -1,
  "0": 0,
  "0.25": 0.25,
  "0.5": 0.5,
  "0.75": 0.75,
  "1": 1,
};

const nowIso = () => new Date().toISOString();

export const DEFAULT_TAGS: Tag[] = [
  { id: "deep-work", name: "深度工作", emoji: "💻", color: "#2563eb", updatedAt: nowIso() },
  { id: "study", name: "学习", emoji: "📚", color: "#7c3aed", updatedAt: nowIso() },
  { id: "exercise", name: "运动", emoji: "🏃", color: "#059669", updatedAt: nowIso() },
  { id: "reading", name: "阅读", emoji: "📖", color: "#d97706", updatedAt: nowIso() },
  { id: "meeting", name: "会议", emoji: "🗂️", color: "#dc2626", updatedAt: nowIso() },
  { id: "creative", name: "创作", emoji: "🎨", color: "#ec4899", updatedAt: nowIso() },
  { id: "rest", name: "休息", emoji: "🌿", color: "#6b7280", updatedAt: nowIso() },
  { id: "entertainment", name: "娱乐放松", emoji: "🎮", color: "#f59e0b", updatedAt: nowIso() },
];

const DEFAULT_SETTINGS: UserSettings = {
  timeGranularity: 60,
  decimalPlaces: 1,
  theme: "light",
  hideSleepTime: true,
  primaryColor: "emerald",
  cloudSyncEnabled: false,
  showDetailsInWeekView: true,
  dailyEnergyGoal: 5,
  weeklyEnergyGoal: 30,
  updatedAt: nowIso(),
};

interface TimeDataStore {
  blocks: Record<string, TimeBlock>;
  totalEnergy: number;
  tags: Tag[];
  settings: UserSettings;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  saveBlock: (dateStr: string, block: TimeBlock) => void;
  deleteBlock: (dateStr: string, blockId: string) => void;
  getBlock: (dateStr: string, hourId: number | string) => TimeBlock | undefined;
  getBlocksForDate: (dateStr: string) => TimeBlock[];
  getDayEnergy: (dateStr: string) => number;
  getWeekEnergy: (weekDates: string[]) => number;
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  updateTag: (tag: Tag) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
  setSyncStatus: (status: boolean) => void;
  setLastSyncedAt: (at: string) => void;
}

function withBlockTimestamp(block: TimeBlock): TimeBlock {
  return {
    ...block,
    updatedAt: block.updatedAt || nowIso(),
  };
}

function withTagTimestamp(tag: Tag): Tag {
  return {
    ...tag,
    updatedAt: tag.updatedAt || nowIso(),
  };
}

export const useTimeStore = create<TimeDataStore>()(
  persist(
    (set, get) => ({
      blocks: {},
      totalEnergy: 0,
      tags: DEFAULT_TAGS,
      settings: DEFAULT_SETTINGS,
      isSyncing: false,
      lastSyncedAt: null,

      setSyncStatus: (status) => set({ isSyncing: status }),
      setLastSyncedAt: (at) => set({ lastSyncedAt: at }),

      saveBlock: (dateStr, incomingBlock) => {
        const newBlock = withBlockTimestamp(incomingBlock);
        set((state) => {
          const key = newBlock.id.startsWith(dateStr) ? newBlock.id : `${dateStr}-${newBlock.id}`;
          const existingBlock = state.blocks[key];
          const oldEnergy = existingBlock?.status === "completed" ? SCORE_ENERGY[existingBlock.score] : 0;
          const newEnergy = newBlock.status === "completed" ? SCORE_ENERGY[newBlock.score] : 0;
          return {
            blocks: { ...state.blocks, [key]: newBlock },
            totalEnergy: state.totalEnergy + (newEnergy - oldEnergy),
          };
        });
      },

      deleteBlock: (dateStr, blockId) => {
        set((state) => {
          const key = blockId.startsWith(dateStr) ? blockId : `${dateStr}-${blockId}`;
          const existingBlock = state.blocks[key];
          if (!existingBlock) return state;
          const nextBlocks = { ...state.blocks };
          delete nextBlocks[key];
          const oldEnergy = existingBlock.status === "completed" ? SCORE_ENERGY[existingBlock.score] : 0;
          return {
            blocks: nextBlocks,
            totalEnergy: state.totalEnergy - oldEnergy,
          };
        });
      },

      getBlock: (dateStr, hourId) => {
        const key = typeof hourId === "number" ? `${dateStr}-${hourId}` : hourId;
        return get().blocks[key];
      },

      getBlocksForDate: (dateStr) =>
        Object.entries(get().blocks)
          .filter(([key]) => key.startsWith(dateStr))
          .map(([, block]) => block),

      getDayEnergy: (dateStr) =>
        get()
          .getBlocksForDate(dateStr)
          .filter((block) => block.status === "completed")
          .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0),

      getWeekEnergy: (weekDates) =>
        Object.entries(get().blocks)
          .filter(([key]) => weekDates.some((date) => key.startsWith(date)))
          .map(([, block]) => block)
          .filter((block) => block.status === "completed")
          .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0),

      addTag: (tag) => set((state) => ({ tags: [...state.tags, withTagTimestamp(tag)] })),
      removeTag: (id) => set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) })),
      updateTag: (tag) =>
        set((state) => ({
          tags: state.tags.map((existing) =>
            existing.id === tag.id ? withTagTimestamp(tag) : existing,
          ),
        })),

      updateSettings: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...partial,
            updatedAt: partial.updatedAt || nowIso(),
          },
        })),

      toggleTheme: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            theme: state.settings.theme === "light" ? "dark" : "light",
            updatedAt: nowIso(),
          },
        })),

      exportData: () => {
        const { blocks, tags, settings } = get();
        return JSON.stringify({ blocks, tags, settings, exportedAt: nowIso() }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.blocks) return false;

          const nextBlocks = Object.fromEntries(
            Object.entries(data.blocks as Record<string, TimeBlock>).map(([key, block]) => [
              key,
              withBlockTimestamp(block),
            ]),
          );

          const nextTags = Array.isArray(data.tags)
            ? (data.tags as Tag[]).map(withTagTimestamp)
            : DEFAULT_TAGS;

          set({
            blocks: nextBlocks,
            tags: nextTags,
            settings: {
              ...DEFAULT_SETTINGS,
              ...(data.settings || {}),
              updatedAt: data.settings?.updatedAt || nowIso(),
            },
          });

          const total = Object.values(nextBlocks)
            .filter((block) => block.status === "completed")
            .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);
          set({ totalEnergy: total });
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () =>
        set({
          blocks: {},
          totalEnergy: 0,
          tags: DEFAULT_TAGS,
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "time-lens-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.totalEnergy = Object.values(state.blocks)
          .filter((block) => block.status === "completed")
          .reduce((sum, block) => sum + SCORE_ENERGY[block.score], 0);

        state.tags = (state.tags?.length ? state.tags : DEFAULT_TAGS).map(withTagTimestamp);
        state.settings = {
          ...DEFAULT_SETTINGS,
          ...state.settings,
          updatedAt: state.settings?.updatedAt || nowIso(),
        };
      },
    },
  ),
);
