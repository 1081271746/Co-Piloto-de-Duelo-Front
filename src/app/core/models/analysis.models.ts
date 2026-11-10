import type { SafetyAlert, SafetyGuidance, RiskLevel } from './safety.models';
import type { Exercise } from './library.models';

export type GriefCategory = 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance';
export interface CategoryEstimate { category: GriefCategory; confidence: number; rationale: string }
export interface AnalysisResult {
  emotions: string[];
  categories: CategoryEstimate[];
  summary: string;
  patterns: string[];
  recommended_categories: GriefCategory[];
  risk_level: RiskLevel;
}
export interface EmotionalAnalysis {
  id: string;
  entry_id: string;
  entry_version: number;
  result: AnalysisResult;
  model: string;
  created_at: string;
}
export interface AnalysisResponse {
  analysis: EmotionalAnalysis;
  recommendations: Exercise[];
  safety_alert: SafetyAlert | null;
  realtime_delivered: boolean;
  disclaimer: string;
}
export interface Recommendations {
  items: Exercise[];
  reason: 'analysis_required' | 'analysis_outdated' | 'safety_priority' | 'analysis_based';
  safety_guidance: SafetyGuidance | null;
}
