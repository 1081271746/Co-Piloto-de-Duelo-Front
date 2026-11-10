export interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
}
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  country: string | null;
  category: string;
}
export interface CompletionInput { analysis_id?: string | null; notes?: string | null }
export interface ExerciseCompletion {
  id: string;
  exercise_id: string;
  analysis_id: string | null;
  notes: string | null;
  completed_at: string;
}
