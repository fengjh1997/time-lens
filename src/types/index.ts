export type Score = -1 | 0 | 0.25 | 0.5 | 0.75 | 1;

export type BlockStatus = "planned" | "completed";

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  color: string;
  updatedAt?: string;
}

export interface TimeBlock {
  id: string;
  dayOfWeek?: number;
  hourId: number | string;
  score: Score;
  content: string;
  tagId?: string;
  status: BlockStatus;
  updatedAt?: string;
  pomodoros?: number;
  isBonus?: boolean;
}

export type PrimaryColor = "amber" | "emerald" | "violet" | "blue";

export interface UserSettings {
  timeGranularity: number;
  decimalPlaces: 0 | 1;
  hideSleepTime: boolean;
  theme: "light" | "dark";
  primaryColor: PrimaryColor;
  showTagNamesInWeekView: boolean;
  cloudSyncEnabled?: boolean;
  showDetailsInWeekView: boolean;
  dailyEnergyGoal: number;
  weeklyEnergyGoal: number;
  updatedAt?: string;
}

export interface DayData {
  date: string;
  blocks: Record<string, TimeBlock>;
}
