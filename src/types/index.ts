// Star-based scoring system: -1, 0, 0.25, 0.5, 0.75, 1
export type Score = -1 | 0 | 0.25 | 0.5 | 0.75 | 1;

export type BlockStatus = 'planned' | 'completed';

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex or css color
}

export interface TimeBlock {
  id: string;
  dayOfWeek: number; // 0-6
  hourId: number;    // 0-23 or special ID for Bonus
  score: Score;
  content: string;
  tagId?: string;    // optional tag reference
  status: BlockStatus; // 'planned' = future plan, 'completed' = scored+done
  pomodoros?: number;  // number of 25min pomodoros in this hour (0, 1, 2)
  isBonus?: boolean;   // if true, this is a bonus time block
}

export type PrimaryColor = 'amber' | 'emerald' | 'violet' | 'blue';

export interface UserSettings {
  timeGranularity: number; // 60, 30, 25
  decimalPlaces: 0 | 1;
  hideSleepTime: boolean;
  theme: 'light' | 'dark';
  primaryColor: PrimaryColor;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  blocks: Record<string, TimeBlock>; // Keyed by block ID
}
