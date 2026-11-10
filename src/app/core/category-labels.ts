import type { GriefCategory } from './models/analysis.models';

export const CATEGORY_LABELS: Record<GriefCategory, string> = {
  denial: 'Negación',
  anger: 'Enojo',
  bargaining: 'Negociación',
  depression: 'Tristeza profunda',
  acceptance: 'Aceptación',
};
export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value as GriefCategory] ?? value;
}
export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
