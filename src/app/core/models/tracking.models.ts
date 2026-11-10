export interface TrackingSummary {
  period_days: number;
  since: string;
  counts: { entries: number; analyses: number; completed_exercises: number; alerts: number };
  emotional_states: { state: string; count: number }[];
  disclaimer: string;
}
export interface TrackingTrends {
  period_days: number;
  daily_states: { date: string; state: string; count: number }[];
  emotions: Record<string, number>;
  categories: Record<string, number>;
  analyses_considered: number;
  truncated: boolean;
  disclaimer: string;
}
export interface TimelineEvent {
  type: 'journal' | 'analysis' | 'exercise' | 'alert';
  id: string;
  occurred_at: string;
  related_id: string | null;
}
