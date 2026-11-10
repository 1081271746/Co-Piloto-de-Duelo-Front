export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';
export interface SafetyGuidance {
  risk_level: RiskLevel;
  message: string;
  actions: string[];
  country: string;
  resources: Record<string, string>;
  location_configured: boolean;
  fallback: string;
  emergency_contacted: false;
  disclaimer: string;
}
export interface SafetyAlert {
  id: string;
  entry_id: string | null;
  risk_level: RiskLevel;
  source: string;
  rule_codes: string[];
  guidance: SafetyGuidance;
  acknowledged_at: string | null;
  created_at: string;
}
