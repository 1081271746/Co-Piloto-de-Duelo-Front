import type { SafetyAlert } from './safety.models';

export interface JournalEntry {
  id: string;
  content: string;
  emotional_state: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  version: number;
}
export interface JournalInput { content: string; emotional_state: string; recorded_at?: string }
export interface JournalMutation {
  entry: JournalEntry;
  safety_alert: SafetyAlert | null;
  realtime_delivered: boolean;
}
