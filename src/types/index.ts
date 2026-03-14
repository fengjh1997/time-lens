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
  hourId: number;    // 0-23
  score: Score;
  content: string;
  tagId?: string;    // optional tag reference
  status: BlockStatus; // 'planned' = future plan, 'completed' = scored+done
}

export interface UserSettings {
  timeGranularity: 60 | 30 | 25; // minutes per block
  decimalPlaces: 0 | 1;          // energy display precision
  theme: 'system' | 'light' | 'dark';
}

export interface DayData {
  date: string; // YYYY-MM-DD
  blocks: Record<number, TimeBlock>; // Keyed by hourId
}

export interface WeekData {
  id: string; // e.g., "2024-W12" 
  days: Record<number, DayData>; // Keyed by dayOfWeek
}
