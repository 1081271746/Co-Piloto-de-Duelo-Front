import { Pipe, PipeTransform } from '@angular/core';
import type { RiskLevel } from '../core/models/safety.models';

const formats = {
  long: new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }),
  short: new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }),
  time: new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  weekday: new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }),
};

export type DateStyle = keyof typeof formats;

export function parseDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export function formatDate(value: string | null | undefined, style: DateStyle = 'long'): string {
  if (!value) return '';
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? value : formats[style].format(date);
}

@Pipe({ name: 'esDate' })
export class EsDatePipe implements PipeTransform {
  transform(value: string | null | undefined, style: DateStyle = 'long'): string { return formatDate(value, style); }
}

const CATEGORY_LABELS: Record<string, string> = {
  denial: 'Negación',
  anger: 'Enojo',
  bargaining: 'Negociación',
  depression: 'Tristeza profunda',
  acceptance: 'Aceptación',
};

export const GRIEF_CATEGORIES = Object.keys(CATEGORY_LABELS);

export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

@Pipe({ name: 'category' })
export class CategoryPipe implements PipeTransform {
  transform(value: string): string { return categoryLabel(value); }
}

const RISK_LABELS: Record<RiskLevel, string> = {
  none: 'Sin señales de riesgo',
  low: 'Riesgo bajo',
  moderate: 'Riesgo moderado',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
};

export function riskLabel(value: RiskLevel): string { return RISK_LABELS[value] ?? value; }

@Pipe({ name: 'risk' })
export class RiskPipe implements PipeTransform {
  transform(value: RiskLevel): string { return riskLabel(value); }
}

export function isSafeUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}

export const PAGE_SIZE = 20;
