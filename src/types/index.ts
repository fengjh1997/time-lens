export type Score = -1 | 0 | 1 | 2 | 3 | 4;

export interface Tag {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex or css color
}

export interface TimeBlock {
  id: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hourId: number;    // 0-23
  score: Score;
  content: string;
  tagId?: string;    // optional tag reference
}

export interface DayData {
  date: string; // YYYY-MM-DD
  blocks: Record<number, TimeBlock>; // Keyed by hourId
}

export interface WeekData {
  id: string; // e.g., "2024-W12" 
  days: Record<number, DayData>; // Keyed by dayOfWeek
}
